const observer = new MutationObserver(() => {
    const token = localStorage.getItem('auth@store'); 
    if (token) {
        chrome.storage.local.set({ token: token }, function() {
            console.log("Token đã được lưu");
        });
        observer.disconnect(); 
    }
});

observer.observe(document, {
    childList: true,
    subtree: true
});
