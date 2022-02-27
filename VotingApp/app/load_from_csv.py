import csv
from app.models import *

if __name__ == "__main__":
    with open('../data/house_profile.csv', 'r') as f:
        house_profile = list(csv.reader(f))

    db.session.query(House).delete()

    for [house_id, age_under10, age_10_17, age_18_64, age65_74, age_over74, profile] in house_profile[1:]:
        house = House(house_id=house_id, age_under10=age_under10, age_10_17=age_10_17,
                      age_18_64=age_18_64, age_65_74=age65_74, age_over74=age_over74, profile=profile)
        db.session.add(house)
        print(str(house) + "created!")

    db.session.query(Appliance).delete()
    db.session.query(Usage).delete()

    with open('../data/appliance_ids.csv', 'r') as f:
        appliance_ids = dict((row[0], row[1]) for row in list(csv.reader(f))[1:])
        print(appliance_ids)

    for h in house_profile[1:]:
        house = db.session.query(House).filter_by(house_id=h[0]).first()
        with open('../data/data/' + h[0] + '_events.csv', 'r') as f:
            events = list(csv.reader(f))
            print(str(house) + ":" + str(len(events)))
        for [_, ts, status, samples, pw_min, pw_max, pw_mean, pw_median, pw_var, aid] in events[1:]:
            appliance = db.session.query(Appliance).filter_by(aid=aid, house=house).first()
            if appliance is None:
                appliance = Appliance(aid=aid, name=appliance_ids.get(aid), house=house)
                db.session.add(appliance)
                print(str(appliance) + "created!")
            usage = Usage(timestamp=datetime.utcfromtimestamp(int(ts)),
                          endtime=datetime.utcfromtimestamp(int(ts) + int(samples)),
                          status=bool(int(float(status))), samples=samples,
                          pw_min=pw_min, pw_max=pw_max, pw_mean=pw_mean,
                          pw_median=pw_median, pw_var=pw_var,
                          appliance=appliance, house=house)
            db.session.add(usage)

    db.session.commit()
