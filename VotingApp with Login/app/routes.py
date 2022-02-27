import json

from flask import render_template

from web3 import Web3

import os
from datetime import datetime
from flask import Flask, render_template, session, redirect, \
    url_for, flash, current_app, request
from flask_script import Manager, Shell
from flask_migrate import Migrate, MigrateCommand
from flask_bootstrap import Bootstrap
from flask_login import UserMixin, LoginManager, login_required, \
    login_user, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, \
    BooleanField, IntegerField, ValidationError
from wtforms.validators import DataRequired, Required, Length, Regexp
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask
from config import Config
# from flask_sqlalchemy import SQLAlchemy
# from flask_migrate import Migrate
# from flask_login import LoginManager
from flask_bootstrap import Bootstrap

import random
from xpinyin import Pinyin
from faker import Faker


w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
w3.eth.defaultAccount = w3.eth.accounts[1]

# Get stored abi and contract_address
with open("data.json", 'r') as f:
    datastore = json.load(f)
    abi = datastore["abi"]
    contract_address = datastore["contract_address"]



'''
Config
'''
basedir = os.path.abspath(os.path.dirname(__file__))


def make_shell_context():
    return dict(app=route, db=db, User=User, Role=Role)


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = \
    'sqlite:///' + os.path.join(basedir, 'data.sqlite')
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['AdminPassword'] = 666666
app.config['SECRET_KEY'] = "this is a secret_key"
BOOTSTRAP_SERVE_LOCAL = True
db = SQLAlchemy(app)
manager = Manager(app)
bootstrap = Bootstrap(app)
migrate = Migrate(app, db)
manager.add_command('db', MigrateCommand)
manager.add_command('shell', Shell(make_shell_context))
login_manager = LoginManager(app)

login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
login_manager.login_message = u"You need to login to access this page."


'''
Models
'''


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    users = db.relationship('User', backref='role', lazy='dynamic')

    @staticmethod
    def insert_roles():
        roles = ('Voter', 'Admin')
        for r in roles:
            role = Role.query.filter_by(name=r).first()
            if role is None:
                role = Role(name=r)
            db.session.add(role)
        db.session.commit()

    def __repr__(self):
        return '<Role %r>' % self.name


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.SmallInteger, unique=True, index=True)
    username = db.Column(db.String(64), unique=True, index=True)
    # password = db.Column(db.String(128), default=123456)
    password_hash = db.Column(db.String(128), unique=True, default=123456)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    # devices = db.relationship('Device', backref='user', lazy='dynamic')

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        # 新添加的用户，初始其角色为学生。
        if self.role is None:
            self.role = Role.query.filter_by(name='Voter').first()

    def __repr__(self):
        return '<User %r>' % self.username

    def validate_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # 初次运行程序时生成初始管理员的静态方法
    @staticmethod
    def generate_admin():
        admin = Role.query.filter_by(name='Admin').first()
        u = User.query.filter_by(role=admin).first()
        if u is None:
            u = User(number='zhaowrenee@gmail.com', username='Admin', role=Role.query.filter_by(name='Admin').first())
            u.set_password('666666')
            db.session.add(u)
        db.session.commit()

    def verify_password(self, password):
        return self.password == password


'''
Forms
'''


class LoginForm(FlaskForm):
    number = StringField(u'Username', validators=[DataRequired(), Length(1, 32)])
    password_hash = PasswordField(u'Password', validators=[DataRequired(), Length(1, 32)])
    remember_me = BooleanField(u'Remember Me')
    submit = SubmitField(u'Login')

'''
views
'''

@app.route('/voter')
def voter():
    # Create the contract instance with the newly-deployed address
    voting = w3.eth.contract(address=contract_address, abi=abi)
    filter = voting.events.VoterRegisteredEvent.createFilter(address=contract_address)
    print(filter.get_new_entries())

    return app.send_static_file("voter.html")


@app.route('/admin')
def admin():
    # Create the contract instance with the newly-deployed address
    voting = w3.eth.contract(address=contract_address, abi=abi)
    # print(voting.events.VoterRegisteredEvent.createFilter())

    return app.send_static_file("admin.html")

# 登录，系统只允许管理员登录
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(number=form.number.data).first()
        if user is not None and user.validate_password(
                form.password_hash.data):  # user.verify_password(form.password.data):
            if user.role != Role.query.filter_by(name='Admin').first():
                login_user(user, form.remember_me.data)
                return redirect(url_for('voter'))
            else:
                login_user(user, form.remember_me.data)
                return redirect(url_for('admin'))
        flash(u'Wrong Username or Password！')
    return render_template('login.html', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash(u'Logout Successfully!')
    return redirect(url_for('login'))


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500


# 加载用户的回调函数
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

'''
fake
'''


def fake_user(count=10):
    for i in range(count):
        user = User(username=fake.name(),
                    number=fake.email(),
                    role_id=2)
        user.set_password('123456')
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

'''
增加命令'python app.py init' 
以增加身份与初始管理员帐号
'''

@manager.command
def init():
    from routes import Role, User
    db.drop_all()
    db.create_all()
    Role.insert_roles()
    User.generate_admin()
    fake_user(10)


if __name__ == '__main__':
    manager.run()
