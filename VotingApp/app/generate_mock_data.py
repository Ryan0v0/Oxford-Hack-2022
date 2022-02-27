from dateutil.relativedelta import relativedelta

from app.models import *

if __name__ == "__main__":
    h = db.session.query(House).filter_by(house_id="CM101").first()
    appliances = h.appliances
    usages = h.usages
    len = len(usages)

    i = 0
    for i in range(len):
        usage = usages[i]
        u = Usage(timestamp=usage.timestamp + relativedelta(years=1),
                  endtime=usage.endtime + relativedelta(years=1),
                  status=usage.status, samples=usage.samples,
                  pw_min=usage.pw_min, pw_max=usage.pw_max, pw_mean=usage.pw_mean,
                  pw_median=usage.pw_median, pw_var=usage.pw_var,
                  house=usage.house, appliance=usage.appliance)
        db.session.add(u)

    db.session.commit()
