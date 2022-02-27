from datetime import datetime, timedelta

from sqlalchemy import UniqueConstraint, and_, or_
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, login
from flask_login import UserMixin


class House(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    house_id = db.Column(db.String(5), index=True, unique=True, nullable=False)
    age_under10 = db.Column(db.Integer, nullable=False)
    age_10_17 = db.Column(db.Integer, nullable=False)
    age_18_64 = db.Column(db.Integer, nullable=False)
    age_65_74 = db.Column(db.Integer, nullable=False)
    age_over74 = db.Column(db.Integer, nullable=False)
    profile = db.Column(db.String)
    appliances = db.relationship('Appliance', backref='house')
    usages = db.relationship('Usage', backref='house')
    clusters = db.relationship('Cluster', backref='house')
    activities = db.relationship('Activity', backref='house')
    password_hash = db.Column(db.String(128))

    def __repr__(self):
        return '<Household {}>'.format(self.house_id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Get all usages whose interval intersect with [start, end]
    def get_usages_between(self, start, end, aids=None):
        if aids is None:
            return Usage.query.filter(and_(Usage.timestamp <= end, Usage.endtime > start),
                                      Usage.house_id == self.id).all()
        else:
            appliances = Appliance.query.filter(Appliance.house_id == self.id, Appliance.aid.in_(aids)).all()
            appliance_ids = list(map(lambda app: app.id, appliances))
            return Usage.query.filter(and_(Usage.timestamp < end, Usage.endtime > start),
                                      Usage.aid.in_(appliance_ids), Usage.house_id == self.id).all()

    # Get all usages with the same date as the date of ts
    def get_usages_of_day(self, ts, aids=None):
        today = ts.replace(hour=0, minute=0, second=0)
        tomorrow = today + timedelta(days=1)
        return self.get_usages_between(today, tomorrow, aids)

    # Get all usages whose [timestamp, timestamp+samples] include ts
    def get_usages_at(self, ts, aids=None):
        if aids is None:
            return Usage.query.filter(Usage.timestamp < ts, Usage.endtime > ts,
                                      Usage.house_id == self.id).all()
        else:
            appliances = Appliance.query.filter(Appliance.house_id == self.id, Appliance.aid.in_(aids)).all()
            appliance_ids = list(map(lambda app: app.id, appliances))
            return Usage.query.filter(Usage.timestamp < ts, Usage.endtime > ts,
                                      Usage.aid.in_(appliance_ids), Usage.house_id == self.id).all()

    # Get all usages whose [timestamp, timestamp+samples] include datetime.utcnow()
    def get_latest_usages(self, aids=None):
        return self.get_usages_at(datetime.utcnow(), aids)

@login.user_loader
def load_house(id):
    return House.query.get(int(id))


class Appliance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    aid = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False)
    usages = db.relationship('Usage', backref='appliance')
    house_id = db.Column(db.Integer, db.ForeignKey('house.id'), nullable=False)

    __table_args__ = (UniqueConstraint('aid', 'house_id', name='_appliance_house_uc'),
                      )

    # Get all usages whose interval intersect with [start, end]
    def get_usages_between(self, start, end):
        return Usage.query.filter(and_(Usage.timestamp <= end, Usage.endtime > start),
                                  Usage.aid == self.id).all()

    # Get all usages with the same date as the date of ts
    def get_usages_of_day(self, ts):
        today = ts.replace(hour=0, minute=0, second=0)
        tomorrow = today + timedelta(days=1)
        return self.get_usages_between(today, tomorrow)

    # Get all usages whose [timestamp, timestamp+samples] include ts
    def get_usage_at(self, ts):
        return Usage.query.filter(Usage.timestamp <= ts, Usage.endtime > ts,
                                  Usage.aid == self.id).first()

    # Get all usages whose [timestamp, timestamp+samples] include datetime.utcnow()
    def get_latest_usage(self):
        return self.get_usage_at(datetime.utcnow())

    def __repr__(self):
        return '<Appliance {}-{}>'.format(self.house.id, self.aid)


class Usage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    endtime = db.Column(db.DateTime, index=True)
    status = db.Column(db.Boolean)
    samples = db.Column(db.Integer)
    pw_min = db.Column(db.Float)
    pw_max = db.Column(db.Float)
    pw_mean = db.Column(db.Float)
    pw_median = db.Column(db.Float)
    pw_var = db.Column(db.Float)
    house_id = db.Column(db.Integer, db.ForeignKey('house.id'), nullable=False)
    aid = db.Column(db.Integer, db.ForeignKey('appliance.id'), nullable=False)

    __table_args__ = (UniqueConstraint('aid', 'timestamp', name='_appliance_ts_uc'),
                      )

    def __repr__(self):
        return '<Usage {}>'.format(self.id)


class Cluster(db.Model):
    # id is implicitly declared, others must be provided
    id = db.Column(db.Integer, primary_key=True)
    # Cooking time
    cooking_time = db.Column(db.DateTime, nullable=False)
    # Cooking score
    cooking_score = db.Column(db.Float, nullable=False)
    # Repetition indicator
    repetition = db.Column(db.Float, nullable=False)
    # Activity name
    name = db.Column(db.String, nullable=False)
    # Which user
    house_id = db.Column(db.Integer, db.ForeignKey('house.id'), nullable=False)
    # Feature vectors
    activities = db.relationship('Activity', backref='cluster')


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=datetime.utcnow)
    cluster_id = db.Column(db.Integer, db.ForeignKey('cluster.id'), nullable=False)
    house_id = db.Column(db.Integer, db.ForeignKey('house.id'), nullable=False)

    __table_args__ = (UniqueConstraint('time', 'cluster_id', 'house_id', name='_time_cluster_uc'),
                      )
