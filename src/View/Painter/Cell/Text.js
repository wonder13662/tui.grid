/**
 * @fileoverview Text 편집 가능한 Cell Painter
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * text 타입의 cell renderer
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.Text
     */
    View.Painter.Cell.Text = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.Text.prototype */{
        redrawAttributes: ['isEditable'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        initialize: function(attributes, options) {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });

            this.setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target.closest('td'));
                },
                'ESC': function(keyDownEvent, param) {
                    this._restore(param.$target);
                    this.focusOut(param.$target.closest('td'));
                }
            });
        },
        template: _.template('<input type="<%=type%>" value="<%=value%>" name="<%=name%>" align="center" <%=disabled%> maxLength="<%=maxLength%>"/>'),
        /**
         * input type 을 반환한다.
         * @return {string} input 타입
         * @private
         */
        _getInputType: function() {
            return 'text';
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        /* istanbul ignore next: focus, select 를 검증할 수 없음 */
        focusIn: function($td) {
            var $input = $td.find('input');
            Util.form.setCursorToEnd($input.get(0));
            $input.focus().select();

        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var columnModel = this.getColumnModel(cellData),
                value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
                htmlArr = [];

            htmlArr.push('<input type="');
            htmlArr.push(this._getInputType());
            htmlArr.push('" value="');
            htmlArr.push(value);
            htmlArr.push('" name="');
            htmlArr.push(Util.getUniqueKey());
            htmlArr.push('" align="center" ');
            htmlArr.push(cellData.isDisabled ? 'disabled' : '');
            htmlArr.push(' maxLength="');
            htmlArr.push(columnModel.editOption.maxLength);
            htmlArr.push('"/>');

            return htmlArr.join('');
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var isValueChanged = $.inArray('value', cellData.changed) !== -1,
                $input = $td.find('input');

            if (isValueChanged) {
                $input.val(cellData.value);
            }
            $input.prop('disabled', cellData.isDisabled);
        },
        /**
         * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
         * @param {jQuery} $input   인풋 jquery 엘리먼트
         * @return {Boolean}    값의 변경여부
         * @private
         */
        _isEdited: function($input) {
            return $input.val() !== this.originalText;
        },
        /**
         * 원래 text로 값을 되돌린다.
         * @param {jQuery} $input 인풋 jquery 엘리먼트
         * @private
         */
        _restore: function($input) {
            $input.val(this.originalText);
        },
        /**
         * blur 이벤트 핸들러
         * @param {event} blurEvent 이벤트 객체
         * @private
         */
        _onBlur: function(blurEvent) {
            var $target = $(blurEvent.target),
                rowKey = this.getRowKey($target),
                columnName = this.getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
            this.grid.selection.enable();
        },
        /**
         * focus 이벤트 핸들러
         * @param {Event} focusEvent 이벤트 객체
         * @private
         */
        _onFocus: function(focusEvent) {
            var $input = $(focusEvent.target);
            this.originalText = $input.val();
            this.grid.selection.disable();
        }
    });
    /**
     * Password 타입의 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @constructor View.Painter.Cell.Text.Password
     */
    View.Painter.Cell.Text.Password = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Password.prototype */{
        initialize: function(attributes, options) {
            View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
        },
        /**
         * input type 을 반환한다.
         * @return {string} input 타입
         * @private
         */
        _getInputType: function() {
            return 'password';
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text-password';
        }
    });

    /**
     * input 이 존재하지 않는 text 셀에서 편집시 input 이 존재하는 셀로 변환이 가능한 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.Text.Convertible
     */
    View.Painter.Cell.Text.Convertible = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Convertible.prototype */{
        /**
         * 더블클릭으로 간주할 time millisecond 설정
         * @type {number}
         */
        doubleClickDuration: 500,
        redrawAttributes: ['isDisabled', 'isEditable', 'value'],
        eventHandler: {
            'click': '_onClick',
            'blur input' : '_onBlurConvertible',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForClick: 0,
                editingCell: {
                    rowKey: null,
                    columnName: '',
                    $clickedTd: null
                },
                clicked: {
                    rowKey: null,
                    columnName: null
                }
            });
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text-convertible';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {
            this._startEdit($td);
        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusOut: function($td) {
            //$td.find('input').blur();
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var columnModel = this.getColumnModel(cellData),
                value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
                htmlArr = [];

            if (!this._isEditingCell(cellData)) {
                if (ne.util.isFunction(columnModel.formatter)) {
                    value = columnModel.formatter(value, this.grid.dataModel.get(cellData.rowKey).attributes, columnModel);
                }
                return value;
            } else {
                htmlArr.push('<input type="');
                htmlArr.push(this._getInputType());
                htmlArr.push('" value="');
                htmlArr.push(value);
                htmlArr.push('" name="');
                htmlArr.push(Util.getUniqueKey());
                htmlArr.push('" align="center" ');
                htmlArr.push(cellData.isDisabled ? 'disabled' : '');
                htmlArr.push(' maxLength="');
                htmlArr.push(columnModel.editOption.maxLength);
                htmlArr.push('"/>');

                return htmlArr.join('');
            }
        },
        _isEditingCell: function(cellData) {
            var editingCell = this.editingCell;
            return !!(editingCell.rowKey === cellData.rowKey.toString() && editingCell.columnName === cellData.columnName.toString());
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {},
        /**
         * blur 이벤트 핸들러
         * @param {event} blurEvent 이벤트 객체
         * @private
         */
        _onBlurConvertible: function(blurEvent) {
            var $target = $(blurEvent.target),
                $td = $target.closest('td');
            this._onBlur(blurEvent);
            this._endEdit($td);
        },
        /**
         * text를 textbox 로 교체한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         * @private
         */
        _startEdit: function($td) {
            var isEdit = $td.data('isEdit'),
                $input,
                rowKey = this.getRowKey($td),
                columnName = this.getColumnName($td),
                cellState = this.grid.dataModel.get(rowKey).getCellState(columnName);

            this.editingCell = {
                rowKey: rowKey,
                columnName: columnName
            };

            if (!isEdit && cellState.isEditable && !cellState.isDisabled) {
                this.redraw(this._getCellData($td), $td);
                $input = $td.find('input');
                this.originalText = $input.val();
                Util.form.setCursorToEnd($input.get(0));
                $input.focus().select();
            }
        },
        /**
         * textbox를  text로 교체한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         * @private
         */
        _endEdit: function($td) {
            var cellData = this._getCellData($td);
            this.editingCell = {
                rowKey: null,
                columnName: ''
            };
            this.clicked = {
                rowKey: null,
                columnName: null
            };
            if (cellData) {
                this.redraw(this._getCellData($td), $td);
            }
        },
        /**
         * click 이벤트 핸들러
         * @param {event} clickEvent 이벤트 객체
         * @private
         */
        _onClick: function(clickEvent) {
            var that = this,
                $target = $(clickEvent.target),
                $td = $target.closest('td'),
                address = this._getCellAddress($td);

            if (this._isClickedCell($td)) {
                this._startEdit($td);
            } else {
                clearTimeout(this.timeoutIdForClick);
                this.clicked = address;
                this.timeoutIdForClick = setTimeout(function() {
                    that.clicked = {
                        rowKey: null,
                        columnName: null
                    };
                }, this.doubleClickDuration);
            }
        },
        _isClickedCell: function($td) {
            var address = this._getCellAddress($td);
            return !!(this.clicked.rowKey === address.rowKey && this.clicked.columnName === address.columnName);
        }
    });

