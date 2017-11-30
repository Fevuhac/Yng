function post_page(target) {
    console.log("POST到网页" + target);

    var params = { token: sessionStorage.getItem('user_token') };
    var url = getBaseUrl() + "/admin/" + target;
    
    console.log('url: ', url);
    console.log('params: ', params);
    
    HttpUtil.simulateFormPost(url, params);
}