$(document).ready(function(){
    $('<div id="mqc-modal" class="hidden"></div>').appendTo('body');
    $('<p>Press <kbd>ENTER</kbd> to add, or press <kbd>ESC</kbd> to disgard.</p>').appendTo('#mqc-modal');
    var tmp = '<div>'
            + '<div id="option-form" class="ui form">'
                + '<div class="field">'
                    + '<label>Preserved</label>'
                    + '<div class="ui toggle checkbox">'
                        + '<input type="checkbox" name="preserved" value="preserved">'
                        + '<label>preserved the setting after adding a quote.</label>'
                    + '</div>'
                + '</div>'
                + '<div class="field">'
                    + '<label>Public</label>'
                    + '<div class="ui toggle checkbox">'
                        + '<input type="checkbox" name="public" value="public">'
                        + '<label>Allow <b>anyone</b> to see this quote.</label>'
                    + '</div>'
                + '</div>'
                + '<div class="required field">'
                    + '<label>Quote</label>'
                    + '<textarea name="text"></textarea>'
                + '</div>'
                + '<div class="field">'
                    + '<label>Speaker</label>'
                    + '<input name="speaker" type="text" placeholder="Speaker" value="" maxlength="60">'
                + '</div>'
                + '<div class="field">'
                    + '<label>Tags</label>'
                    + '<div class="tag-search ui search">'
                        + '<div class="ui left icon input">'
                            // + '<i class="tags icon"></i>'
                            + '<input class="prompt" id="option-tag-input" type="text" placeholder="Enter categories" style="width: auto;">'
                        + '</div>'
                        + '<div class="ui labels">'
                        + '</div>'
                        + '<div class="results"></div>'
                    + '</div>'
                + '</div>'
                + '<div class="field">'
                    + '<label>Book/Source</label>'
                    + '<input name="book" type="text" placeholder="Book/Source" maxlength="100">'
                + '</div>'
                + '<div class="field">'
                    + '<label>Volume/More Information</label>'
                    + '<input name="volume" type="text" placeholder="Volume/More Information" maxlength="30">'
                + '</div>'
                + '<div class="ui red right floated submit button">Save</div>'
            + '</div>'
        + '</div>'
    ;
    $(tmp).appendTo('#mqc-modal');

    $('.ui.checkbox').checkbox();

    $('#option-tag-input').on('keydown', tagInputKeyDown); // Tag input set up
    $('.tag-search .content').on('keydown', function(e){
        e.stopPropagation();
    })
    $('.tag-search').on('keydown', function(e){
        var code = e.keyCode || e.which;
        if (code !== 27) // 27: esc
            e.stopPropagation();
    })
    $('textarea').on('keydown', function(e){
        var code = e.keyCode || e.which;
        if (code !== 27) // 27: esc
            e.stopPropagation();
    })

    var quote_form_rules = {
            text: {
                identifier: 'text',
                revalidate: true,
                rules: [
                    {
                        type: 'empty',
                        prompt : 'Please enter the quote'
                    },
                ], // TODO: set max length
            },
            /*
            referenceURL: {
                identifier: 'referenceURL',
                optional: true,
                revalidate: true,
                rules: [
                    {
                        type: 'url',
                        prompt: 'Please enter a URL (don\'t forget the "http://" or "https://"'
                    }
                ], 
            }  // TODO: other fields
            */
        };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(sender.tab ?  "from a content script:" + sender.tab.url : "from the extension");
        if (sender.tab || request.setting_options.mode === 'fast' || $('#mqc-modal').transition('is visible')){
            sendResponse(null);
            return true;
        } else {
            console.log(request);
            var quote = request.quote_options;
            quote.text = window.getSelection().toString();
            $('.tag-search').search({
                source: getTagSearchContent(request.tag_list),
                searchFields: [ 'title' ],
                searchFullText: true,
                maxResults: 10,
            });

            fillForm($('#option-form'), quote);
            $('#option-form')
                .form(quote_form_rules, {
                    on: 'submit',
                    keyboardShortcuts: false,
                    onSuccess: function(){
                        if ($('#mqc-modal').transition('is visible')) {
                            $('#mqc-modal').transition('fade down');
                        }
                        quote = getFormObject('#option-form');
                        clearForm($('#option-form'));
                        sendResponse(quote);
                    }
                })
            ;
            // show
            if (!$('#mqc-modal').transition('is visible')) {
                $('#mqc-modal').transition('fade down');
            }
            // autofocus
            if ($('#option-form [name="speaker"]').val() === '') {
                $('#option-form [name="speaker"]').focus();
            } else {
                $('#option-form #option-tag-input').focus();
            }

            $('#mqc-modal').on('keydown', function(e){
                e.stopPropagation();
                var code = e.keyCode || e.which;
                if (code === 13) {
                    $('mqc-modal').unbind('keydown');
                    $('#option-form').form('submit');
                } else if (code === 27) {
                    $('mqc-modal').unbind('keydown');
                    if ($('#mqc-modal').transition('is visible')) {
                        $('#mqc-modal').transition('hide');
                    }
                    clearForm($('#option-form'));
                    sendResponse(null);
                }
            })

            return true; // Listener must return true is you want to sendResponse after returning
        }
    }); 

    var origin_padding = 13;
    function tagInputKeyDown(e) { // TODO: delete not the last
        var code = e.keyCode || e.which;
        // console.log(code);
        // console.log(e);
        
        if (code === 13 && $(this).val() !== '' && $(this).parents('.tag-search').find('.results.visible .result').hasClass('active')){
            e.preventDefault();
            e.stopPropagation();
        } else if (code === 188 && $(this).val() === ''){ // 188: comma
            e.preventDefault(); 
        } else if ((code === 188 || code === 9 || code === 13) && $(this).val() !== '') { // 188: comma, 9: tab, 13: enter
            console.log('2');
            e.preventDefault(); 
            e.stopPropagation();
            var tagList = $(this).closest('.ui.search').find('.ui.labels');
            $('<a class="ui tiny label">' + $(this).val().trim() + '</a>').appendTo(tagList);
            var tag_width = tagList.width(); 
            this.style.setProperty('padding-left', String(origin_padding + tag_width) + 'px', 'important');
            $(this).val('');
        } else if (code === 8 && $(this).val() === ''){ // 8: backspace
            e.preventDefault(); 
            var prev = $(this).closest('.ui.search').find('a.ui.label').last();
            if (prev.hasClass('yellow')){
                prev.remove();
                var tagList = $(this).closest('.ui.search').find('.ui.labels');
                var tag_width = tagList.width();
                this.style.setProperty('padding-left', String(origin_padding + tag_width) + 'px', 'important');
            }
            else{
                prev.addClass('yellow');
            }
        } else if ($(this).val() !== '' || code >= 48 && code <= 90 || code >= 96 && code <= 111 || code >= 186 && code <= 222){ // 48~90: 0~z, 96~111: numberpad 0 ~ devide, 186~222: semi-colon ~ single quote
            var prev = $(this).closest('.ui.search').find('.ui.label').last();
            prev.removeClass('yellow');
        } else if (code === 13 && $(this).val() !== ''){ // Press Entry when having a value does nothing
            e.stopPropagation(); 
            e.preventDefault(); 
        }
    }

    function fillForm(form, object){
        if (object.preserved){
            console.log(object.preverved);
            $(form).find('.ui.checkbox input[name="preserved"]').parent().checkbox('check');
        }

        if (object.public)
            $(form).find('.ui.checkbox input[name="public"]').parent().checkbox('check');
        console.log(object);

        $(form).find('textarea[name="text"]').removeAttr('disabled');
        $(form).find('textarea[name="text"]').val(object['text']);
        $(form).find('input:text').each(function(index, element){
            if (object.hasOwnProperty($(element).attr('name'))){
                $(element).val(object[$(element).attr('name')]);
                $(element).attr('placeholder', $(element).parent().find('label').text());
            }
        });
        var tagList = $(form).find('.ui.labels');
        tagList.empty();
        if (object.tags) {
            object.tags.forEach(function(entry){
                $('<a class="ui tiny label">' + entry + '</a>').appendTo(tagList);
            });
        }
        var tag_width = tagList.width();
        $(tagList).parent().find('input').each(function(){
            this.style.setProperty('padding-left', String(origin_padding + tag_width) + 'px', 'important');
        });
    }

    function getFormObject(form){
        var object = {};
        $(form).find('input:checked').each(function(index, element){
            object[$(element).attr('name')] = true;
        });
        $(form).find('textarea').each(function(index, element){
            if ($(element).val() != ""){
                object[$(element).attr('name')] = $(element).val();
            }
        });
        $(form).find('input:text').each(function(index, element){
            if ($(element).val() != ""){
                object[$(element).attr('name')] = $(element).val();
            }
        });
        object.tags = [];
        $(form).find('.ui.labels a.ui.label').each(function(){
            object.tags.push($(this).text());
        });
        var input = $(form).find('input[id$="-tag-input"]').val();
        //input = input.trim().replace(',', '');
        if (input != ''){
            object.tags.push(input);
        }
        if (object.tags === []){
            delete object.tags; 
        }
        return object;
    }

    function clearForm(form) {
        $(':input', form)
            .not(':button, :submit, :reset, :hidden')
            .val('')
            .removeAttr('checked')
            .removeAttr('selected'); 
        $(form).find('.tag-search .ui.labels a.label').remove();
        $(form).find('.tag-search input.prompt')[0].style.setProperty('padding-left', String(origin_padding) + 'px', 'important');
    }

    function getTagSearchContent(tag_list){
        var content = [];
        tag_list.forEach(function(entry){
            content.push({ title: $('<p>').text(entry.name).html() });
        });
        return content;
    }

});
