console.log("sw loaded");

self.addEventListener('push', event => {

  const data = event.data.json();
  localDate = new Date(data.time);
  self.registration.showNotification(data.title, {
    body: data.body + "\norario di notifica:" + data.time,
  });
});