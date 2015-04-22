$(document).ready(function() {
    console.log("Loading...");
    String.prototype.hashCode = function(){
        var hash = 0;
        if (this.length === 0)
            return hash;
        for (i = 0; i < this.length; i++) {
            var char = this.charCodeAt(i);
            hash = ((hash<<5)-hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    String.prototype.color = function(color_list){
        if(color_list.length === 0)
            return '';
        return color_list[((this.hashCode() % color_list.length) + color_list.length) % color_list.length];
    }


    $('.ui.accordion')
        .accordion()
    ;

    $('.ui.checkbox')
      .checkbox()
    ;

    chrome.storage.local.get({
        setting_options: {
            url: 'http://memoquote.herokuapp.com',
            mode: 'detail',
            autoUrl: true
        },
        quote_options: {}
    }, function(items){
        var url = items.setting_options.url;
        console.log(url);
        $('#myquote-button').attr('href', url + '/quotes/');
    }); 


    $('#option-form .clear').on('click', function(){
        $(':input','#option-form')
            .not(':button, :submit, :reset, :hidden')
            .val('')
            .removeAttr('checked')
            .removeAttr('selected'); 
        $('#option-form .tag-search .ui.labels a.label').remove();
        var origin_padding = 40;
        $('#option-form .tag-search input.prompt')[0].style.setProperty('padding-left', String(origin_padding) + 'px', 'important');
        save_options();
    });

    $('#option-tag-input').on('keydown', tagInputKeyDown); // Tag input set up
    function tagInputKeyDown(e) { // TODO: delete not the last
        var code = e.keyCode || e.which;
        // console.log(code);
        // console.log(e);
        
        if(code === 13 && $(this).val() !== '' && $(this).parents('.tag-search').find('.results.visible .result').hasClass('active')){
            e.preventDefault();
            e.stopPropagation();
        } else if((code === 188 || code === 9 || code === 13) && $(this).val() !== '') { // 188: comma, 9: tab, 13: enter
            console.log('2');
            e.preventDefault(); 
            e.stopPropagation();
            var origin_padding = 40;
            var tagList = $(this).closest('.ui.search').find('.ui.labels');
            $('<a class="ui tiny label">' + $(this).val().trim() + '</a>').appendTo(tagList);
            var tag_width = tagList.width(); 
            this.style.setProperty('padding-left', String(origin_padding + tag_width) + 'px', 'important');
            $(this).val('');
            save_options(getFormObject('#option-form'));
        } else if(code === 188 && $(this).val() === ''){ // 188: comma
            e.preventDefault(); 
        } else if(code === 8 && $(this).val() === ''){ // 8: backspace
            e.preventDefault(); 
            var prev = $(this).closest('.ui.search').find('a.ui.label').last();
            if(prev.hasClass('yellow')){
                prev.remove();
                var origin_padding = 40;
                var tagList = $(this).closest('.ui.search').find('.ui.labels');
                var tag_width = tagList.width();
                this.style.setProperty('padding-left', String(origin_padding + tag_width) + 'px', 'important');
                save_options(getFormObject('#option-form'));
            }
            else{
                prev.addClass('yellow');
            }
        } else if($(this).val() !== '' || code >= 48 && code <= 90 || code >= 96 && code <= 111 || code >= 186 && code <= 222){ // 48~90: 0~z, 96~111: numberpad 0 ~ devide, 186~222: semi-colon ~ single quote
            var prev = $(this).closest('.ui.search').find('.ui.label').last();
            prev.removeClass('yellow');
        } else if(code === 13 && $(this).val() !== ''){ // Press Entry when having a value does nothing
            console.log('hi');
            e.stopPropagation(); 
            e.preventDefault(); 
        }
    }

    $('#option-form :input').on('change', function(){
        console.log('change');
        console.log(this);
        save_options(getFormObject('#option-form'));
    });

    load_options();
    function save_options(options){
        console.log(options); 
        chrome.storage.local.set({'quote_options': options});
    }

    function load_options(){
        chrome.storage.local.get('quote_options', function(item){
            fillForm('#option-form', item.quote_options);
        });
    }

    function getFormObject(form){
        var object = {};
        $(form).find('input:checked').each(function(index, element){
            object[$(element).attr('name')] = true;
        });
        $(form).find('input:text').each(function(index, element){
            if($(element).val() != ""){
                object[$(element).attr('name')] = $(element).val();
            }
        });
        object.tags = [];
        $(form).find('.ui.labels a.ui.label').each(function(){
            object.tags.push($(this).text());
        });
        var input = $(form).find('input[id$="-tag-input"]').val().trim().replace(',', '');
        if(input != ''){
            object.tags.push(input);
        }
        if(object.tags === []){
            delete object.tags; 
        }
        return object;
    }

    function fillForm(form, object){
        if(object.preserved){
            console.log(object.preverved);
            $(form).find('.ui.checkbox input[name="preserved"]').parent().checkbox('check');
        }

        if(object.public)
            $(form).find('.ui.checkbox input[name="public"]').parent().checkbox('check');
        console.log(object);

        $(form).find('textarea[name="text"]').removeAttr('disabled');
        $(form).find('textarea[name="text"]').val(object['text']);
        $(form).find('input:text').each(function(index, element){
            if(object.hasOwnProperty($(element).attr('name'))){
                $(element).val(object[$(element).attr('name')]);
                $(element).attr('placeholder', $(element).parent().find('label').text());
            }
        });
        var tagList = $(form).find('.ui.labels');
        tagList.empty();
        object.tags.forEach(function(entry){
            $('<a class="ui tiny label">' + entry + '</a>').appendTo(tagList);
        });
        var origin_padding = 40;
        var tag_width = tagList.width();
        $(tagList).parent().find('input').each(function(){
            this.style.setProperty('padding-left', String(origin_padding + tag_width) + 'px', 'important');
        });
    }
});
