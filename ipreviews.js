$.fn.ipreviews = function(options){
    var $this = $(this);
    var data = $this.data('ipreviews');
    if (!data) {
        data = new IPreviews(this, options);
        $this.data('ipreviews', data);
    }
    return data;
}
IPSGlobal = {
    appendItemTemplate:'<div style="margin-left:10px;margin-bottom:10px;float:left;" class="el-upload el-upload--picture-card"><i class="fa fa-plus"></i></div>',
    inputTemplate:'<input style="display:none" class="ipreview-upload-input" type="file" name="file" accept="image/*" multiple="multiple">',
    itemTemplate: '<div class="preview-items"><img src="" alt=""><div class="preview-delete" style="display:none"><i class="fa fa-trash"></i></div></div>',
    previewTemplate:'<div class="preview-container"></div>'
}
$.fn.ipreviews.IPSGlobal = IPSGlobal;
var IPreviews = function(element, options) {
    this.element = $(element);
    this.options = options?options:{};
    this._itemIndex = 0;

    this.max = this.options.max;
    this.error = this.options.error;

    this._initElement();

    this._events = [];
    this._items = [];
    this._images = [];
    this._imagesDetail = [];

    this._buildEvents();
    this._attachEvents();

    this.sortable = new Sortable(this.element[0], {
        draggable:".preview-items",
        ghostClass: "ghost"
    });
}

IPreviews.prototype = {
    setImages:function(urls, key = null) {
        for(var i=0; i<urls.length; i++) {
            var url = urls[i]
            if (key) {
                url = urls[i][key];
            }
            this._appendItem(url, true);
        }
    },
    appentImage:function(url, data) {
        this._appendItem(url, true, data);
    },
    getImages:function() {
        var images = [];
        this.element.find(".preview-items").each(function() {
            console.log($(this).data("data").file);
            images.push($(this).data("data"));
        });
        return images;
    },
    _initElement:function() {
        this.appendItem = $(IPSGlobal.appendItemTemplate);
        this.inputItem = $(IPSGlobal.inputTemplate);
        this.previewContainer = $(IPSGlobal.previewTemplate);
        this.preview = this.previewContainer.find('.preview-items');

        this.appendItem.appendTo(this.element);
        this.inputItem.appendTo(this.element);
    },
    _buildEvents: function() {
        this._detachEvents();
        this._events = [];
        this._events.push(
            [this.appendItem, {click: $.proxy(this.clickInput, this)}],
            [this.inputItem, {change: $.proxy(this.inputChanged, this)}],
            [this.element, {mouseover: $.proxy(this.previewHover, this)}],
            [this.element, {mouseleave: $.proxy(this.previewOut, this)}],
        );
        for(var i=0; i<this._items.length; i++) {
            var item = this._items[i];
            this._events.push(
                [item.find('.preview-delete'), {click: $.proxy(this.clickDelete, this)}]
            );
        }
    },
    _attachEvents: function() {
        this._detachEvents();
        this._applyEvents(this._events);
    },
    _detachEvents: function(){
        this._unapplyEvents(this._events);
    },
    _applyEvents: function(evs){
        for (var i=0, el, ch, ev; i < evs.length; i++){
            el = evs[i][0];
            if (evs[i].length === 2){
                ch = undefined;
                ev = evs[i][1];
            } else if (evs[i].length === 3){
                ch = evs[i][1];
                ev = evs[i][2];
            }
            el.on(ev, ch);
        }
    },
    _unapplyEvents: function(evs){
        for (var i=0, el, ev, ch; i < evs.length; i++){
            el = evs[i][0];
            if (evs[i].length === 2){
                ch = undefined;
                ev = evs[i][1];
            } else if (evs[i].length === 3){
                ch = evs[i][1];
                ev = evs[i][2];
            }
            el.off(ev, ch);
        }
    },
    clickInput: function() {
        this.inputItem.trigger("click");
    },
    inputChanged:function(e) {
        var file = e.target.files || e.dataTransfer.files;
        if (file) {
            for(var i=0; i<file.length; i++) {
                var that = this;
                this._appendItem(file[i], false);
            }
        }
    },
    _appendItem:function(file, url = false, data) {
        if (this.max && this._items.length >= this.max) {
            this.appendItem.css('display', 'none');
            return;
        }
        var el = $(IPSGlobal.itemTemplate);
        var itemList = this.element.find(".preview-items");
        if (!itemList || itemList.length == 0) {
            this.element.prepend(el);
        }else{
            this.element.find(".preview-items").last().after(el);
        }
        if (url) {
            this._images.push(url);
        }else{
            var reader = new FileReader();
            reader.onload = function() {
                el.find('img').attr('src', this.result);
            }
            reader.readAsDataURL(file);
        }
        el.data("target", this._itemIndex++);
        el.data("data", {url:url, file:file, data:data});
        this._items.push(el);
        this._buildEvents();
        this._attachEvents();
        if (this.max && this._items.length >= this.max) {
            this.appendItem.css('display', 'none');
        }
    },
    previewOut:function(e) {
        this.element.find(".preview-delete").css('display', 'none');
    },
    previewHover:function(e) {
        var target = $(e.target);
        if (e.target.className == "") {
            this.element.find(".preview-delete").css('display', 'none');
            target.parent().find('.preview-delete').css('display', 'block');
        }
    },
    clickDelete:function(e) {
        // this.reset();
        var target = $(e.target);
        if (target.is('i')) {
            target = target.parent();
        }
        this._removeItem(target.parent());
    },
    _removeItem(el) {
        for(var i=0; i<this._items.length; i++) {
            if (this._items[i].data('target') == el.data('target')) {
                this._items.splice(i, 1);
                break;
            }
        }
        el.remove();
        if (this.max && this._items.length >= this.max) {
            this.appendItem.css('display', 'none');
        }else{
            this.appendItem.css('display', 'block');
        }
    }
}

