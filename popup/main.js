;
(function () {
    'use strict';

    window.biaoPopup = {
        boot
    };
    //定义全文变量,整个js文件可见
    let trigger, popup, mask, config;
    let defaultConfig = {
        position: 'center',
        offsetY: 0,
        offsetX: 0,
        on: 'click',
    };



    /**
     * 设置必要的弹出层信息
     * @param {string} triggerSelector 点谁弹出（选择器）
     * @param {string} popupSelector 弹出谁（选择器）
     */
    function boot(triggerSelector, popupSelector, custom = {}) {
        //取到trigger 和 弹出层对象
        trigger = document.querySelector(triggerSelector);
        popup = document.querySelector(popupSelector);
        //加载用户的配置
        loadConfig(custom);
        // 准备弹出层
        initPopup();
        //准备遮罩
        initMask();
        //绑定打开事件
        bindOpen();
        //绑定关闭事件
        bindClose();
    }

    function loadConfig(custom) {
        //合并默认对象和用户的对象.存到config中,并且不覆盖默认对象,因为默认对象前面有一个{}空对象,
        // Object.assign() 不止能合并对象,还返回一个新对象. 如果不传空对象{},就覆盖第一个值
        config = Object.assign({}, defaultConfig, custom);
    }

    /**
     * 初始化Popup元素
     */
    function initPopup() {
        //弹出层默认隐藏
        popup.hidden = true;
        //为弹出层添加一个新类,这个新类用来表现弹出层样式  (插件类)
        popup.classList.add('yo-popup');
    }

    /**
     * 初始化遮罩
     */
    function initMask() {
        //创建一个div元素,也就是mask,
        mask = document.createElement('div');
        //为mask添加一个类名yo-mask, 这个类写了遮罩的样式, (插件遮罩类);
        mask.classList.add('yo-mask');
        //默认得是隐藏的;
        mask.hidden = true;
        //把它添加到body最后
        document.body.appendChild(mask);
    }

    /**
     * 绑定打开相关事件
     *
     * 如：
     * 设置Popup的可见性
     * 定位Popup到合适的位置
     */
    function bindOpen() {
        trigger.addEventListener(config.on, () => {
            //弹出层和遮罩都显示
            setVisibility(true);
            //显示弹出层位置,由用户传入的对象属性决定. 定位到合适位置
            rePositionPopup(config.position, config.offsetY, config.offsetX);
        });
        // 调整弹出层位置;
        btnPosition();
    }

    //调整弹出框位置
    function btnPosition() {
        // 1.
        //给所哟button的母元素(popup弹出框)绑定事件,如果点击,e.target就是那个按钮对象
        //然后用e.target.dataset.popup找到自定义的data-popup
        popup.addEventListener(config.on, e => {
            rePositionPopup(e.target.dataset.popup);
        })

        //2.
        //找到所有的按钮对象
        // let btns = popup.querySelectorAll('button');
        // //循环每个按钮
        // btns.forEach(button => {
        //     //为每个按钮对象添加事件
        //     button.addEventListener(config.on, () => {
        //         rePositionPopup(button.dataset.popup);
        //     })
        // });
    }
    /**
     * 定位Popup
     *
     * 由于Popup的初始位置往往很奇怪，
     * 所以每个Popup在打开时都应该调整位置
     * @param {string} position 支持的位置有：
     *    center|top|bottom|left|right|top-left|top-right|bottom-left|bottom-right
     * @param yOffset 标准定位后的纵向偏移，单位：px
     * @param xOffset 标准定位后的横向偏移，单位：px
     */
    function rePositionPopup(position = 'center', yOffset = 0, xOffset = 0) {
        // 获取元素本身的尺寸
        let width = popup.offsetWidth;
        let height = popup.offsetHeight;
        // 获取浏览器窗口的尺寸
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        //如果位置不包括‘xxx-xxx'形式 ,也就是 ‘xxx'形式
        if (!position.includes('-')) {
            if (position == 'left' || position == 'right')
                position += 'centery'; // 纵向就默认居中,就变成‘xxx-centery'
            //如果仅指定纵向
            else if (position == 'top' || position == 'bottom')
                position += 'centerx'; // 横向就默认居中，变成"xxx-centerx"
            else // 否则就全都居中，这其中就包含"center"
                position = 'centerx-centery';
        }

        // 是否横向居中
        if (position.includes('centerx'))
            popup.style.left = windowWidth / 2 - width / 2 + xOffset + 'px';

        // 是否纵向居中
        if (position.includes('centery'))
            popup.style.top = windowHeight / 2 - height / 2 + yOffset + 'px';

        // 是否贴在左边
        if (position.includes('left'))
            popup.style.left = xOffset + 'px'

        // 是否贴在右边
        if (position.includes('right')) {
            popup.style.left = 'auto';
            popup.style.right = xOffset + 'px';
        }

        // 是否贴在顶部
        if (position.includes('top'))
            popup.style.top = yOffset + 'px';

        // 是否贴在底部
        if (position.includes('bottom')) {
            popup.style.top = 'auto';
            popup.style.bottom = yOffset + 'px';
        }

    }

    /**
     * 绑定关闭相关事件
     *
     * 如：
     * 设置Popup的可见性
     * 绑定关闭快捷键
     */
    function bindClose() {
        //当遮罩被点击时
        mask.addEventListener(config.on, () => {
            //弹出层和遮罩都隐藏
            setVisibility(false);
        });
        //为window绑定快捷键Escape;关闭  // 如果按了快捷键"Escape"
        window.addEventListener('keyup', e => {
            // 就隐藏Popup和遮罩
            if (e.key == 'Escape')
                setVisibility(false);
        });
    }

    /**
     * 设置是否可见
     * @param {boolean} show true为显示，false为隐藏
     */
    function setVisibility(show = false) {
        // 同时显示或隐藏Popup和遮罩
        mask.hidden = popup.hidden = !show;
    }
})();