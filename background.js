window.onload = function() {
    var vk_group_messages_link = "https://vk.com/groups?tab=admin";
    var vk_group_access_token = false;
    var vk_refresh_interval = 60;
    
    // Listen for settings changes
    chrome.storage.onChanged.addListener(function(new_config, string) {
        //console.log(new_config);
        
        if ( new_config.vkAccessToken ) {
            vk_group_access_token = new_config.vkAccessToken.newValue;
            vk_get_messages_count_run();
        }
        if ( new_config.vkImLink ) {
            vk_group_messages_link = new_config.vkImLink.newValue;        
        }
        if ( new_config.vkRefreshFreq ) {
            vk_refresh_interval = new_config.vkRefreshFreq.newValue;        
        }
    });
    
    chrome.storage.sync.get({
        vkAccessToken: false,
        vkImLink: '',
        vkRefreshFreq: 60
    }, function(config) {
        if ( !config.vkAccessToken ) {
            chrome.browserAction.setBadgeText({text: "?"});
            chrome.browserAction.setTitle({title: "Необходимо указать access_token в настройках!"});          
        }
        
        vk_group_access_token = config.vkAccessToken;
        vk_group_messages_link = config.vkImLink;
        vk_refresh_interval = config.vkRefreshFreq;
 
        // Make Icon Clikable
        chrome.browserAction.onClicked.addListener(function() {
            chrome.tabs.query({
                currentWindow: true,
                active: true
            }, function(tab) {
                chrome.tabs.create({
                    "url": vk_group_messages_link
                });
            });
        });    

        
        var vk_get_messages_count = 0;
        
        var vk_get_messages_count_run = function() {   

            if ( !vk_group_access_token ) {
                chrome.browserAction.setBadgeText({text: "?"});
                chrome.browserAction.setTitle({title: "Необходимо указать access_token в настройках!"});
                return false;               
            }
            //JSON.parse('{"response":{"count":1,"items":[{"unread":1,"message":{"id":9,"date":1475940365,"out":0,"user_id":18354982,"read_state":0,"title":" ... ","body":"sdfsdf"},"in_read":1,"out_read":8}]}}');
            
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://api.vk.com/method/messages.getDialogs?v=5.57&unread=1&access_token=" + vk_group_access_token, true);
            xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {
                  console.log(resp);
                // JSON.parse does not evaluate the attacker's scripts.
                var resp = JSON.parse(xhr.responseText);
                if ( resp.error ) {
                    chrome.browserAction.setBadgeText({text: "?"});
                    chrome.browserAction.setTitle({title: "Ошибка > " + resp.error.error_msg});
                    notifyUser('Ошибка при получении сообщений: ', resp.error.error_msg);
                    return false;                
                }
                
                if ( resp.response.count > 0 && resp.response.count > vk_get_messages_count ) {
                    notifyUser('Новое сообщение [' + resp.response.count + ']');
                }
                
                vk_get_messages_count = resp.response.count;
                
                chrome.browserAction.setBadgeText({text: vk_get_messages_count.toString()});
                var currentdate = new Date(); 
                
                chrome.browserAction.setTitle({
                        title: vk_get_messages_count 
                        + " новых сообщений (обновлено "
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds() + ")" 
                    });
                    
                
                    
              }
            }
            xhr.send();
            
            // 60 * 1000 >> 1 minute        
            setTimeout(vk_get_messages_count_run, vk_refresh_interval * 1000);
        }
        // 60 * 1000 >> 1 minute        
        //window.setInterval();
        vk_get_messages_count_run();
        window.vk_get_messages_count_run = vk_get_messages_count_run;
        
    });       
    
    
        
    function notifyUser(title, body) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
            var notification = new Notification(title, {"body": body});
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification(title, {"body": body});
                }
            });
        }

        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
    }    
    
}