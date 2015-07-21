/**
 * Created by Ellery1 on 15/7/20.
 */
$(function(){

    var data = [{
        name: '贝多芬',
        birthday: '1770',
        sex: '男',
        title: 'Maestro',
        action: 'echo'
    }, {
        name: '莫扎特',
        birthday: '1756',
        sex: '男',
        title: 'Maestro',
        action: 'echo'
    }, {
        name: '巴赫',
        birthday: '1685',
        sex: '男',
        title: 'Maestro',
        action: 'echo'
    }, {
        name: '乔治桑',
        birthday: '1800',
        sex: '女',
        title: 'Writer',
        action: 'echo'
    }, {
        name: '肖邦',
        birthday: '1810',
        sex: '男',
        title: 'Romantic Composer',
        action: 'echo'
    }, {
        name: '李斯特',
        birthday: '1811',
        sex: '男',
        title: 'Pianist',
        action: 'echo'
    }, {
        name: '拉赫玛尼诺夫',
        birthday: '1873',
        sex: '男',
        title: 'Romantic Composer',
        action: 'echo'
    }, {
        name: 'Argerich',
        birthday: '1940',
        sex: '女',
        title: 'pianist',
        action: 'echo'
    }];

    var option = {
        //源数据，必需
        src: data,
        //不用管
        filterType: 1,
        //每页显示条目的选项，可以省略，默认值[5,10,20]
        pageSizes: [1, 2, 3, 5, 10, 20],
        //字体大小，可以省略
        fontSize: "12px",
        //是否可编辑，可以省略
        editable: true,
        //目标div的id，必需
        renderTo: "#xtable",
        //是否可排序，可以省略，默认可排序
        sortable: true,
        //行是否可选，可以省略，默认可选
        selectable: true,
        //行是否可删除，可以省略，默认不可删除
        deletable: true,
        //删除前执行的函数，可以省略。参数1：当前删除的行的数据的json，参数2：所有数据的json
        //当这个函数返回false时，删除操作不会被执行
        beforeDelete: function (data, orgSrc) {
            console.log(data);
            if (confirm('确定删除 ' + data.length + ' 人吗？')) {
                return true;
            }
            return false;
        },
        //删除后执行的回调，可以省略，参数同上
        //编辑，排序操作同样拥有这两个函数。分别是beforeEdit,editCb和beforeSort
        deleteCb: function (data, orgSrc) {
            console.log('deleted:' + data);
        },
        //保存编辑时触发的回调，这里实现了一个简单的输入验证功能
        //当输入值不合法时会弹出提示消息，并再次开启编辑功能（即原操作不会被保存）
        editCb: function (editedObj, row) {
            console.log(editedObj);
            if (isNaN(Number(editedObj.birthday)) || (editedObj.sex !== '男' && editedObj.sex !== '女')) {
                alert('您输入的信息不合法，请检查！');
                $(row).find(".editBtn").click();
                return;
            }
            //return true;
        },
        //是否显示一列编辑按钮，可以省略
        showEditCol: false,
        //是否包含过滤器，可以省略，默认为包含
        hasFilter: true,
        //是否可以选择列的可见性，可以省略，默认为可选择
        colEditable: true,
        //控制条的位置，可以设为top/bottom,默认为top
        controllerPosition: 'top',
        //列的设置，name:列名，data:关联的属性名，width:宽度，可以是百分数也可以是px,
        //另外还可以分别设置某列是否可排序，是否可过滤，是否可编辑
        columns: [{
            name: "姓名",
            data: "name",
            width: "30%",
            //可以对每列分别设置这些属性
            sortable: true,
            hasFilter: true,
            editable: true
        }, {
            name: "性别",
            data: "sex",
            width: "10%"
        }, {
            name: "生日",
            data: "birthday",
            width: "25%"
        }, {
            name: "头衔",
            data: "title",
            width: "25%"
        }, {
            name: '操作',
            data: 'action',
            width: '10%',
            sortable: false,
            hasFilter: false
        }],
        //超链接列的设置,colIndex：将第x列设为超链接；renderer：用于生成超链接href,参数index是当前行的index，src[index]即可
        //获得当前行的json
        linkCols: [{
            colIndex: 4,
            type: 'button',
            onclick: function (trData, a) {
                console.log(trData);
            }
        }]
    };

    var table = XUtil.XTable(option);
    //设置每页显示5条
    table.setPageSize(5);

    table.extendFunction({
        fName: '添加一行',
        handler: function (selectedData, orgSrc) {
            table.addRow({
                    name: '请输入姓名',
                    sex: '请输入性别',
                    birthday: '请输入生日',
                    action: 'echo'
                },
                //beforeAdd
                function () {

                },
                //addCallback
                function (dataObj) {
                    console.log(dataObj);
                    $(table.pageController).find('.addRow').button({disabled: true});
                });
        },
        className: 'addRow'
    });

    console.log(table);
});