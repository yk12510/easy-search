$(function () {
    var search = $('#search-container');
    var form = search.find('.search-form>form');
    var keyword = form.find('input.keyword');

    var engine = 'google';

    if($.cookie('engine')) {
        engine = $.cookie('engine');
        setEngine(engine);
    }

    /* Logo字体颜色随机 */
    var randomColor = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];
    search.find('.search-logo .random-color').each(function () {
        $(this).css('color', randomColor[parseInt(getRandomNum(0, 4))]);
    });

    /* 搜索引擎切换 */
    var engineEl = $('#engine');
    var timer = null;
    $('.engine').hover(function () {
        clearTimeout(timer);
        engineEl.show();
    }, function () {
        clearTimeout(timer);
        timer = setTimeout(function(){
            engineEl.hide();
        }, 200);
    });
    engineEl.on('click', 'li', function () {
        engine = $(this).attr('engine');
        setEngine(engine);
        engineEl.hide();
    });

    /*
    * 设置搜索引擎,默认Google
    * */
    function setEngine(engine) {
        engine = engine || 'google';
        $('.engine').find('span').text(engineJson[engine].name);
        form.attr('action', engineJson[engine].formUrl);
        keyword.attr('name', engineJson[engine].keyword);
        $.cookie('engine', engine, { expires: 90});
    }
});

/*
* 搜索引擎配置
* */
var engineJson = {
    baidu: {
        name: '百度',
        formUrl: 'https://www.baidu.com/s',
        keyword: 'wd'
    },
    google: {
        name: 'Google',
        formUrl: 'https://www.google.com.hk/search',
        keyword: 'q',
        hotwordUrl: 'https://www.google.com.hk/complete/search',
        hotword: 'q'
    }
};

/*
* 获取min-max之间的随机数（不包含max）
* @min  最小值
* @max  最大值
* */
function getRandomNum(min, max) {
    return Math.random() * Math.abs(max - min) + (max > min ? min : max);
}