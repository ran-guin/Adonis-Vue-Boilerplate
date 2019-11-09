function check (from, to, type) {
  var now = new Date();
  var fromTime = new Date(from);

  var toTime
  if (to) {
    toTime = new Date(to)
  } else {
    toTime = now
    if (type==='end') {
      if (from.length === 10) {
        fromTime = new Date(from + ' 23:59:59');
      } else if (from.length === 13) {
        fromTime = new Date(from + ':59:59');
      } else if (from.length === 16) {
        fromTime = new Date(from + ' :59');
      }
    }

    // Adjust 'from' time to local timezone if both timestamps are not supplied
    var offset = 0 // now.getTimezoneOffset()
    var adjusted = fromTime.getTime() - offset * 60 * 1000
    fromTime = new Date(adjusted)
    // console.log(fromTime)
    // console.log(toTime)
  }

  var timediff = toTime.getTime() - fromTime.getTime();

  var status = 'undef'
  if (timediff === 0) {
    status = 'happening'
  } else if (timediff < 0) {
    timediff = timediff * -1;
    status = 'before';
  } else {
    status = 'after';
  }
  
  const timegap = this.calcTime(timediff);
  return {status: status, from: fromTime, to: toTime, timegap: timegap}
}

function calcTime (timediff) {
  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(timediff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timediff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timediff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timediff % (1000 * 60)) / 1000);
  return {days: days, hours: hours, minutes: minutes, seconds: seconds};
}

export default {check, calcTime};
