$(function () {
    /* Logo字体颜色随机 */
    $('#search-container').find('.search-logo .random-color').each(function () {
        $(this).css('color', '#' + parseInt(getRandomNum(2000, 3549)).toString(16));
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