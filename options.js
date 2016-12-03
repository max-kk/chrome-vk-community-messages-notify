// Saves options to chrome.storage.sync.
function save_options() {
    var vkAccessToken = document.getElementById('vkAccessToken').value;
    var vkImLink = document.getElementById('vkImLink').value;
    var vkRefreshFreq = document.getElementById('vkRefreshFreq').value;
    chrome.storage.sync.set({
        vkAccessToken: vkAccessToken,
        vkImLink: vkImLink,
        vkRefreshFreq: vkRefreshFreq
    }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
        status.textContent = 'Сохранено!';
        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        vkAccessToken: '',
        vkImLink: '',
        vkRefreshFreq: 60
    }, function(items) {
        document.getElementById('vkAccessToken').value = items.vkAccessToken;
        document.getElementById('vkImLink').value = items.vkImLink;
        document.getElementById('vkRefreshFreq').value = items.vkRefreshFreq;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);