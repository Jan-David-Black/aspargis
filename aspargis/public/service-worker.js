self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
});

self.addEventListener("push", e => {
    console.log(e)
    const data = e.data.json();
    self.registration.showNotification(
        data.title, // title of the notification
        {
            body: "Push notification from section.io", //the body of the push notification
            image: "https://cdn.pixabay.com/photo/2015/12/16/17/41/bell-1096280_1280.png",
            icon: "https://cdn.pixabay.com/photo/2015/12/16/17/41/bell-1096280_1280.png" // icon 
        }
    );
});