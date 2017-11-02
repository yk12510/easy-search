$(function () {
    /* Logo字体颜色随机 */
    var randomColor = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];
    $('#search-container').find('.search-logo .random-color').each(function () {
        $(this).css('color', randomColor[parseInt(getRandomNum(0, 4))]);
    });
});

/*
* 获取min-max之间的随机数（不包含max）
* @min  最小值
* @max  最大值
* */
function getRandomNum (min, max) {
    return Math.random() * Math.abs(max - min) + (max > min ? min : max);
}