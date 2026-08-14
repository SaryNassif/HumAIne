const countdown = document.querySelector('[data-countdown]');

if (countdown) {
  const target = new Date(countdown.dataset.countdown).getTime();
  const fields = {
    days: countdown.querySelector('[data-days]'),
    hours: countdown.querySelector('[data-hours]'),
    minutes: countdown.querySelector('[data-minutes]'),
    seconds: countdown.querySelector('[data-seconds]')
  };
  const status = countdown.querySelector('[data-countdown-status]');
  const pad = value => String(value).padStart(2, '0');

  const updateCountdown = () => {
    const remaining = target - Date.now();
    if (remaining <= 0) {
      Object.values(fields).forEach(field => { field.textContent = '00'; });
      status.textContent = 'Registration has closed.';
      return false;
    }
    fields.days.textContent = pad(Math.floor(remaining / 86400000));
    fields.hours.textContent = pad(Math.floor(remaining / 3600000) % 24);
    fields.minutes.textContent = pad(Math.floor(remaining / 60000) % 60);
    fields.seconds.textContent = pad(Math.floor(remaining / 1000) % 60);
    return true;
  };

  updateCountdown();
  const timer = setInterval(() => {
    if (!updateCountdown()) clearInterval(timer);
  }, 1000);
}
