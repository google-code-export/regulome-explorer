

function registerLayoutListeners() {
     var d = vq.events.Dispatcher;
    d.addListener('data_ready','dataset_labels',function(obj){
        loadListStores(obj);
         resetFormPanel();
     //   requestFeatureFilteredData();
    });
    d.addListener('data_ready','annotations',function(obj){
        vq.events.Dispatcher.dispatch(new vq.events.Event('dataset_selected','main','pv10_brca_pairwise_associations_0914'));
     });
    d.addListener('render_complete','circvis',function(circvis_plot){
       exposeCirclePlot();
        var nav = Ext.getCmp('nav_check').checked;
        vq.events.Dispatcher.dispatch(new vq.events.Event('modify_circvis','main_menu',{pan_enable:nav,zoom_enable:nav}));
    });
    d.addListener('render_complete','circvis_features',function(circvis_plot){
        exposeCirclePlot();
        var nav = Ext.getCmp('nav_check').checked;
        vq.events.Dispatcher.dispatch(new vq.events.Event('modify_circvis','main_menu',{pan_enable:nav,zoom_enable:nav}));
    });
    d.addListener('render_complete','linear',function(linear){
       exposeLinearPlot(linear.chr, linear.start, linear.range);
    });
    d.addListener('render_complete','linear_features',function(linear){
        exposeLinearPlot(linear.chr, linear.start, linear.range);
    });
    d.addListener('data_ready','filteredfeatures',function(obj) {
        loadDataTableStore(obj.data);
    });
}

/*
Window manipulation
*/

function hideDatasetWindow() {
    dataset_window.hide();
}

function showSVGDialog() {
    export_window.show();
    export_svg();
}

function export_svg() {
    var serializer = new XMLSerializer();
    var svg_tags;
    var panel_dom = Ext.DomQuery.selectNode('div#circle-panel>svg');
    if (panel_dom !== undefined){
        svg_tags=serializer.serializeToString(panel_dom);
    }
    Ext.getCmp('export-textarea').setRawValue(svg_tags);
}

function exportDataDialog() {
    downloadNetworkData(document.getElementById('frame'),this.value);
    }

function openHelpWindow(subject,text) {
    if (helpWindowReference == null || helpWindowReference.closed) {
        helpWindowReference = window.open('','help-popup','width=400,height=300,resizable=1,scrollbars=1,status=0,'+
        'titlebar=0,toolbar=0,location=0,directories=0,menubar=0,copyhistory=0');
    }
        helpWindowReference.document.title='Help - ' + subject;
        helpWindowReference.document.body.innerHTML = '<b>' + subject +'</b><p><div style=width:350>' + text + '</div>';
        helpWindowReference.focus();
}

function openBrowserWindow(url,width,height) {
        var w = width || 640, h = height || 480;
       window.open(url,'help-popup','width='+w+',height='+h+',resizable=1,scrollbars=1,status=0,'+
        'titlebar=0,toolbar=0,location=0,directories=0,menubar=0,copyhistory=0');
}

function openBrowserTab(url) {
        var new_window = window.open(url,'_blank');
        new_window.focus();
}

/*
        Filters
 */
function requestFilteredData() {
    prepareVisPanels();
    var task = new Ext.util.DelayedTask(function(){
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_request','associations',{filter:getFilterSelections()}));
    });
            task.delay(300);
}

function requestFeatureFilteredData() {
    prepareVisPanels();
    var task = new Ext.util.DelayedTask(function(){
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_request','filteredfeatures',{filter:getFeatureFilterSelections()}));
    });
    task.delay(300);
}

function getFeatureFilterSelections() {
    var type = Ext.getCmp('feature_type_combo').getValue();
    var label = Ext.getCmp('feature_label_field').getValue();
    
    return {
        type:type,
        label: label,
        clin: Ext.getCmp('feature_clin_label').getValue(),
        chr: Ext.getCmp('feature_chr_combo').getValue(),
        start: Ext.getCmp('feature_chr_start').getValue(),
        stop: Ext.getCmp('feature_chr_stop').getValue(),
        score: Ext.getCmp('feature_score').getValue(),
        score_fn: Ext.getCmp('feature_score_fn').getValue(),
        correlation: Ext.getCmp('feature_correlation').getValue(),
        correlation_fn : Ext.getCmp('feature_correlation_fn').getValue()

    };
}

/*
getFilterSelections
    gathers the selections of each filter widget, packs it into a single object, and returns it
    easier to consume by event listeners, hopefully?
 */
function getFilterSelections() {
    var type_1 = Ext.getCmp('f1_type_combo').getValue();
    var label_1;
     switch(type_1) {
         case('CLIN'):
         label_1 = Ext.getCmp('f1_clin_label').getValue();
         break;
          default :
           label_1 = Ext.getCmp('f1_label_field').getValue();
    }
     var type_2 = Ext.getCmp('f2_type_combo').getValue();
    var label_2;
     switch(type_2) {
         case('CLIN'):
         label_2 = Ext.getCmp('f2_clin_label').getValue();
         break;
          default :
           label_2 = Ext.getCmp('f2_label_field').getValue();
    }
   return   {
        f1_type:type_1,
        f1_label: label_1,
        f1_chr:Ext.getCmp('f1_chr_combo').getValue(),
        f1_start:Ext.getCmp('f1_chr_start').getValue(),
        f1_stop: Ext.getCmp('f1_chr_stop').getValue(),
        f2_type:type_2,
        f2_label:label_2,
        f2_chr:Ext.getCmp('f2_chr_combo').getValue(),
        f2_start:Ext.getCmp('f2_chr_start').getValue(),
        f2_stop: Ext.getCmp('f2_chr_stop').getValue(),
        correlation:Ext.getCmp('correlation').getValue(),
        order:  Ext.getCmp('order_combo').getValue(),
        limit: Ext.getCmp('limit_combo').getValue(),
        correlation_fn:    Ext.getCmp('correlation_fn').getValue(),
        pvalue:  Ext.getCmp('max_pvalue').getValue(),
        score:  Ext.getCmp('score').getValue(),
        score_fn: Ext.getCmp('score_fn').getValue()
       };
}

function resetFeatureFormPanel() {
    Ext.getCmp('feature_type_combo').reset(),
        Ext.getCmp('feature_label_field').reset(),
        Ext.getCmp('feature_chr_combo').reset(),
        Ext.getCmp('feature_clin_label').reset(),
        Ext.getCmp('feature_chr_start').reset(),
        Ext.getCmp('feature_chr_stop').reset(),
        Ext.getCmp('feature_score').reset(),
        Ext.getCmp('feature_score_fn').reset(),
        Ext.getCmp('feature_max_pvalue').reset(),
        Ext.getCmp('feature_correlation_fn').reset(),
        Ext.getCmp('feature_order_combo').reset(),
        Ext.getCmp('feature_limit_combo').reset()
}

function resetFormPanel() {
    Ext.getCmp('f1_type_combo').reset(),
            Ext.getCmp('f1_label_field').reset(),
            Ext.getCmp('f1_chr_combo').reset(),
            Ext.getCmp('f1_clin_label').reset(),
            Ext.getCmp('f1_chr_start').reset(),
            Ext.getCmp('f1_chr_stop').reset(),
            Ext.getCmp('f2_type_combo').reset(),
            Ext.getCmp('f2_label_field').reset(),
            Ext.getCmp('f2_chr_combo').reset(),
            Ext.getCmp('f2_clin_label').reset(),
            Ext.getCmp('f2_chr_start').reset(),
            Ext.getCmp('f2_chr_stop').reset(),
        Ext.getCmp('score').reset(),
        Ext.getCmp('score_fn').reset(),
            Ext.getCmp('max_pvalue').reset(),
        Ext.getCmp('correlation').reset(),
        Ext.getCmp('correlation_fn').reset(),
            Ext.getCmp('order_combo').reset(),
            Ext.getCmp('limit_combo').reset()
}

/*
  should be called by an event listener
 */
function loadListStores(dataset_labels) {
    var label_list = dataset_labels.types.map(function(row) {
        return {value:row.key, label: row.value};
        });
        label_list.unshift({value:'*',label:'All'});
    Ext.StoreMgr.get('feature_type_combo_store').loadData(label_list);
        Ext.getCmp('feature_type_combo').setValue('*');
        Ext.StoreMgr.get('f1_type_combo_store').loadData(label_list);
        Ext.getCmp('f1_type_combo').setValue('*');
        Ext.StoreMgr.get('f2_type_combo_store').loadData(label_list);
        Ext.getCmp('f2_type_combo').setValue('*');

    var clin_list = dataset_labels.clin.map(function(row) {
        return {value: row.label, label: row.label};
    });
     Ext.StoreMgr.get('feature_clin_list_store').loadData(clin_list);
    Ext.StoreMgr.get('f1_clin_list_store').loadData(clin_list);
    Ext.StoreMgr.get('f2_clin_list_store').loadData(clin_list);
     
}

function loadDataTableStore(data) {
    var mapped_data = data.map(function(row) {
  return {source: row.source,label: row.label,chr: row.chr,
      start: row.start,end:row.end,
                     score : row.score, sign : row.sign, pvalue:row.pvalue };
                            });
 Ext.StoreMgr.get('data_grid_store').loadData(mapped_data);
}


/*clean divs*/

function prepareVisPanels() {
    network_mask = new Ext.LoadMask('randomforest-panel', {msg:"Loading Data..."});
    network_mask.show();
    wipeLinearPlot();
}

function wipeLinearPlot(){
    Ext.getCmp('linear-parent').setTitle('Chromosome-level View');
        document.getElementById('linear-panel').innerHTML='';
        Ext.getCmp('linear-parent').collapse(true);
}

function exposeCirclePlot(){
    Ext.getCmp('circle-parent').expand(true);
   network_mask.hide();
}
function exposeLinearPlot(chr,start,range_length) {
    Ext.getCmp('linear-parent').expand(true);
    Ext.getCmp('linear-parent').setTitle('Chromosome-level View: Chromosome ' + chr);
    var task = new Ext.util.DelayedTask(function(){
        var rf =  Ext.getCmp('rf-graphical').body;
        var d = rf.dom;
        rf.scroll('b',d.scrollHeight - d.offsetHeight,true);
    });
    task.delay(300);
}

function openRFPanel() {
loadDataLabelLists(function() {
    if (Ext.get('circle-panel').dom.firstChild.id != ""){
        getFilterSelections();
    }
});
}

function registerAllListeners() {
    registerLayoutListeners();
    registerDataRetrievalListeners();
    registerModelListeners();
    registerPlotListeners();
}

Ext.onReady(function() {
   Ext.QuickTips.init();

    registerAllListeners();

    var randomforestPanel = new Ext.Panel({
        id:'randomforest-panel',
        name:'randomforest-panel',
        layout : 'border',
        frame : false,
        border : false,
        defaults: {
            bodyStyle: 'padding:5px',
            animFloat: false,
            floatable: false
        },
        items:[
            {region: 'center', id: 'view-region',
                xtype: 'tabpanel',
                border : false,
                activeTab : 0,
                items: [               {
                    xtype : 'panel', id :'rf-graphical',
                    layout : 'auto', title: 'Graphical',
                    autoScroll : 'true',
                    items: [{
                        xtype: 'panel', id:'circle-parent',
                        layout : 'absolute',
                        height: 900,
                        width:1050,
                        collapsible : true,
                        title : 'Genome-level View',
                        tools: [{
                            id: 'help',
                            handler: function(event, toolEl, panel){
                                openHelpWindow('Genome-level View',genomeLevelHelpString);
                            }}],
                        items : [ {
                            xtype: 'panel', id:'circle-panel',
                            width:800,
                            x:20,
                            y:20
                        },
                            {
                                xtype: 'panel', id:'circle-legend-panel',
                                width:150,
                                border:false,
                                frame : false,
                                x:880,
                                y:20
                            }]
                    }, {
                        xtype: 'panel', id:'linear-parent',
                        layout : 'absolute',
                        height: 800,
                        width:1050,
                        collapsible : true,
                        collapsed : true,
                        title : 'Chromosome-level View',
                        tools: [{
                            id: 'help',
                            handler: function(event, toolEl, panel){
                                openHelpWindow('Chromosome-level View',chromosomeLevelHelpString);
                            }}],
                        items : [ {
                            xtype: 'panel', id:'linear-panel',
                            width:800,
                            x:20,
                            y:20,
                            html: 'For a Chromosome-level view of the data, select a point of focus from the Genome-level View.<p>' +
                                    'Click on:' +
                                    '<ol><li>Chromosome Label</li><li>Tick Label</li>'
                        },
                            {
                                xtype: 'panel', id:'linear-legend-panel',
                                width:150,
                                border:false,
                                frame : false,
                                x:840,
                                y:20
                            }]
                    }]},  {
                    xtype: 'panel',  id:'grid-panel',
                    name : 'grid-panel',
                    title : 'Data Table',
                    monitorResize : true,
                    autoScroll : false,
                    layout : 'fit',
                    height: 650,
                    width:1050,
                    collapsible : false,
                    tools: [{
                        id: 'help',
                        handler: function(event, toolEl, panel){
                            openHelpWindow('Data-level View',dataLevelViewHelpString);
                        }}],
                    items : [
                        {
                            xtype:'grid',
                            id : 'data_grid',
                            name : 'data_grid',
                            autoScroll:true,
                            monitorResize: true,
                            autoWidth : true,
                            height: 650,
                            viewConfig: {
                                        forceFit : true
                            },
                            cm : new Ext.grid.ColumnModel({
                                columns: [
                                    { header: "Type", width: 40,  id:'source', dataIndex:'source'},
                                    { header: "Label", width: 120, id: 'label',dataIndex:'label'},
                                    { header: "Chr", width:30 , id:'chr', dataIndex:'chr'},
                                    { header: "Start", width:70, id:'start',dataIndex:'start'},
                                    { header: "Stop", width:70, id:'end',dataIndex:'end'},
                                    { header: "Score", width:50, id:'score',dataIndex:'score'},
                                    { header: "Pvalue", width:50, id:'pvalue',dataIndex:'pvalue'},
                                    { header: "Sign", width:20, id:'sign',dataIndex:'sign'}
                                ],
                                defaults: {
                                    sortable: true,
                                    width: 100
                                }
                            }),
                            store : new Ext.data.JsonStore({
                                autoLoad:false,
                                storeId:'data_grid_store',
                                fields : ['source','label','chr','start','end','score','pvalue','sign']
                            })
//                            listeners: {
//                                rowclick : function(grid,rowIndex,event) {
//                                    var record = grid.getStore().getAt(rowIndex);
//                                    var link = {};link.sourceNode = {};link.targetNode = {};
//                                    link.sourceNode.id = record.get('target_id');
//                                    link.targetNode.id = record.get('source_id');
//                                    vq.events.Dispatcher.dispatch(new vq.events.Event('click_association','associations_table',link));
//                                }
//                            }
                        }]
                }]},
            {region: 'east',
                collapsible: true,
                floatable: true,
                autoHide:false,
                split: true,
                width: 280,
                title: 'Tools',
                layout: {
                    type: 'accordion'
                },
                tools: [{
                    id: 'help',
                    handler: function(event, toolEl, panel){
                        openHelpWindow('Tools',toolsHelpString);
                    }}],
                items: [{
                    xtype: 'form', id:'filter_features',
                    title : 'Filter Features',
                    bodyStyle:'padding:5px 5px 5px 5px',
                    defaults:{anchor:'100%'},
                    border : false,
                    labelAlign : 'right',
                    labelWidth: 70,
                    labelSeparator : '',
                    defaultType:'textfield',
                    monitorValid : true,
                    buttons : [
                                {
                                    text: 'Filter',
                                    formBind : true,
                                    listeners : {
                                        click : function(button,e) {
                                            requestFeatureFilteredData();
                                        }
                                    }
                                },
                                { text: 'Reset',
                                    listeners : {
                                        click : function(button,e) {
                                            resetFeatureFormPanel();
                                        }
                                    }
                                }
                            ],
                    tools: [{
                       id: 'help',
                        handler: function(event, toolEl, panel){
                            openHelpWindow('Filtering',filteringHelpString);
                        }}],
                    items :[  {  xtype:'fieldset',
                        title:'Feature',
                        collapsible: true,
                        collapsed: false,
                        defaults:{anchor:'100%'},
                        labelWidth: 70,
                        labelSeparator : '',
                        defaultType:'textfield',
                        autoHeight:true,
                        items:[
                            {
                                xtype:'combo',
                                name:'feature_type_combo',
                                id:'feature_type_combo',
                                mode:'local',
                                allowBlank : true,
                                store: new Ext.data.JsonStore({
                                    autoLoad : false,
                                    fields : ['value','label'],
                                    idProperty:'value',
                                    data: [
                                        {value: '*',label:'All'}
                                    ],
                                    storeId:'feature_type_combo_store'
                                }),
                                fieldLabel:'Type',
                                valueField:'value',
                                displayField:'label',
                                tabIndex : 0,
                                typeAhead : true,
                                selectOnFocus:true,
                                triggerAction : 'all',
                                forceSelection : true,
                                emptyText : 'Clinical Correlate',
                                value : '*'
                            }, {
                                name:'feature_label_field',
                                id:'feature_label_field',
                                emptyText : 'Input Label...',
                                tabIndex: 1,
                                selectOnFocus:true,
                                fieldLabel:'Label'
                            }, {
                                name:'feature_clin_label',
                                mode:'local',
                                id:'feature_clin_label',
                                xtype:'combo',
                                allowBlank : false,
                                autoSelect : true,
                                hidden:false,
                                store: new Ext.data.JsonStore({
                                    autoLoad : false,
                                    data: [],
                                    fields : ['value','label'],
                                    idProperty:'value',
                                    storeId:'feature_clin_list_store'
                                }),
                                listWidth:200,
                                fieldLabel:'Clinical Feature',
                                selectOnFocus:true,
                                forceSelection : true,
                                triggerAction : 'all',
                                valueField:'value',
                                displayField:'label',
                                emptyText:'CLIN Feature...'
                            },
                            {
                                xtype:'combo', name:'feature_chr_combo',id:'feature_chr_combo',
                                mode:'local',
                                allowBlank : false,
                                store: new Ext.data.JsonStore({
                                    autoLoad : true,
                                    fields : ['value','label'],
                                    idProperty:'value',
                                    data: chrom_list,
                                    storeId:'feature_chr_combo_store'
                                }),
                                fieldLabel:'Chromosome',
                                valueField:'value',
                                displayField:'label',
                                tabIndex : 2,
                                selectOnFocus:true,
                                forceSelection : true,
                                triggerAction : 'all',
                                emptyText : 'Select Chr...',
                                value : '*'
                            },{xtype : 'numberfield',
                                id:'feature_chr_start',
                                name :'feature_chr_start',
                                allowNegative: false,
                                decimalPrecision : 0,
                                emptyText : 'Input value...',
                                invalidText:'This value is not valid.',
                                maxValue: 250999999,
                                minValue:1,
                                tabIndex : 1,
                                validateOnBlur : true,
                                allowDecimals : false,
                                fieldLabel : 'Start >=',
                                value : ''
                            },{xtype : 'numberfield',
                                id:'feature_chr_stop',
                                name :'feature_chr_stop',
                                allowNegative: false,
                                decimalPrecision : 0,
                                emptyText : 'Input value...',
                                invalidText:'This value is not valid.',
                                maxValue: 250999999,
                                minValue:1,
                                tabIndex : 1,
                                validateOnBlur : true,
                                allowDecimals : false,
                                fieldLabel : 'Stop <=',
                                value : ''
                            },
                                        abs_value_field('Score','feature_score',2,100,-100),
                                        abs_value_field('Correlation','feature_correlation',0.1,1,-1)
                                   ]
                    }]
                },{
                    xtype: 'panel', id:'filters',
                    title : 'Filter Links',
                    autoScroll : true,
                    height : 250,
                    tools: [{
                        id: 'help',
                        handler: function(event, toolEl, panel){
                            openHelpWindow('Filtering',filteringHelpString);
                        }}],
                    items :[
                        { xtype:'form',
                            id :'filter_panel',
                            name :'filter_panel',
                            bodyStyle:'padding:5px 5px 5px 5px',
                            defaults:{anchor:'100%'},
                            border : false,
                            labelAlign : 'right',
                            labelWidth: 70,
                            labelSeparator : '',
                            defaultType:'textfield',
                            monitorValid : true,
                            buttons : [
                                {
                                    text: 'Filter',
                                    formBind : true,
                                    listeners : {
                                        click : function(button,e) {
                                            requestFilteredData();
                                        }
                                    }
                                },
                                { text: 'Reset',
                                    listeners : {
                                        click : function(button,e) {
                                            resetFormPanel();
                                        }
                                    }
                                }
                            ],
                            items : [
                                {  xtype:'fieldset',
                                    title:'Node 1',
                                    collapsible: true,
                                    collapsed: true,
                                    defaults:{anchor:'100%'},
                                    labelWidth: 70,
                                    labelSeparator : '',
                                    defaultType:'textfield',
                                    autoHeight:true,
                                    items:[
                                        {
                                            xtype:'combo',
                                            name:'f1_type_combo',
                                            id:'f1_type_combo',
                                            mode:'local',
                                            allowBlank : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : false,
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                data: [
                                                    {value: '*',label:'All'}
                                                ],
                                                storeId:'f1_type_combo_store'
                                            }),
                                            fieldLabel:'Type',
                                            valueField:'value',
                                            displayField:'label',
                                            tabIndex : 0,
                                            typeAhead : true,
                                            selectOnFocus:true,
                                            triggerAction : 'all',
                                            forceSelection : true,
                                            emptyText : 'Select a Type...',
                                            value : '*',
                                            listeners : {
                                                select : function(field,record, index) {
                                                    switch(record.id)  {
                                                        case('CLIN'):
                                                            Ext.getCmp('f1_label_field').setVisible(false);
                                                            Ext.getCmp('f1_clin_label').setVisible(true);
                                                            break;
                                                        default:
                                                            Ext.getCmp('f1_label_field').setVisible(true);
                                                            Ext.getCmp('f1_clin_label').setVisible(false);
                                                    }
                                                }
                                            }
                                        }, {
                                            name:'f1_label_field',
                                            id:'f1_label_field',
                                            emptyText : 'Input Label...',
                                            tabIndex: 1,
                                            selectOnFocus:true,
                                            fieldLabel:'Label'
                                        }, {
                                            name:'f1_clin_label',
                                            mode:'local',
                                            id:'f1_clin_label',
                                            xtype:'combo',
                                            allowBlank : false,
                                            hidden:true,
                                            autoSelect : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : false,
                                                data: [],
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                storeId:'f1_clin_list_store'
                                            }),
                                            listWidth:200,
                                            fieldLabel:'Clinical Feature',
                                            selectOnFocus:true,
                                            forceSelection : true,
                                            triggerAction : 'all',
                                            valueField:'value',
                                            displayField:'label',
                                            emptyText:'CLIN Feature...',
                                            value:'*'
                                        },
                                        {
                                            xtype:'combo', name:'f1_chr_combo',id:'f1_chr_combo',
                                            mode:'local',
                                            allowBlank : false,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : true,
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                data: chrom_list,
                                                storeId:'f1_chr_combo_store'
                                            }),
                                            fieldLabel:'Chromosome',
                                            valueField:'value',
                                            displayField:'label',
                                            tabIndex : 2,
                                            selectOnFocus:true,
                                            forceSelection : true,
                                            triggerAction : 'all',
                                            emptyText : 'Select Chr...',
                                            value : '*'
                                        },{xtype : 'numberfield',
                                            id:'f1_chr_start',
                                            name :'f1_chr_start',
                                            allowNegative: false,
                                            decimalPrecision : 0,
                                            emptyText : 'Input value...',
                                            invalidText:'This value is not valid.',
                                            maxValue: 250999999,
                                            minValue:1,
                                            tabIndex : 1,
                                            validateOnBlur : true,
                                            allowDecimals : false,
                                            fieldLabel : 'Start >=',
                                            value : ''
                                        },{xtype : 'numberfield',
                                            id:'f1_chr_stop',
                                            name :'f1_chr_stop',
                                            allowNegative: false,
                                            decimalPrecision : 0,
                                            emptyText : 'Input value...',
                                            invalidText:'This value is not valid.',
                                            maxValue: 250999999,
                                            minValue:1,
                                            tabIndex : 1,
                                            validateOnBlur : true,
                                            allowDecimals : false,
                                            fieldLabel : 'Stop <=',
                                            value : ''
                                        }
                                    ]},
                                {  xtype:'fieldset',
                                    title:'Node 2',
                                    collapsible: true,
                                    collapsed: true,
                                    defaults:{anchor:'100%'},
                                    labelWidth: 70,
                                    labelSeparator : '',
                                    defaultType:'textfield',
                                    autoHeight:true,
                                    items:[
                                        {
                                            xtype:'combo',
                                            name:'f2_type_combo',
                                            id:'f2_type_combo',
                                            mode:'local',
                                            allowBlank : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : false,
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                data: [
                                                    {value: '*',label:'All'}
                                                ],
                                                storeId:'f2_type_combo_store'
                                            }),
                                            fieldLabel:'Type',
                                            valueField:'value',
                                            displayField:'label',
                                            tabIndex : 0,
                                            typeAhead : true,
                                            selectOnFocus:true,
                                            triggerAction : 'all',
                                            forceSelection : true,
                                            emptyText : 'Select a Type...',
                                            value : '*',
                                             listeners : {
                                                 select : function(field,record, index) {
                                                                    switch(record.id)  {
                                                        case('CLIN'):
                                                                  var label_cmp = Ext.getCmp('f2_label_field'),
                                                                clin_cmp = Ext.getCmp('f2_clin_label');
                                                        label_cmp.setVisible(false);
                                                        clin_cmp.setVisible(true);
                                                                break;
                                                        default:
                                                        var label_cmp = Ext.getCmp('f2_label_field'),
                                                                clin_cmp = Ext.getCmp('f2_clin_label');
                                                        label_cmp.setVisible(true);
                                                        clin_cmp.setVisible(false);
                                                    }
                                                }
                                            }
                                        }, {
                                            name:'f2_label_field',
                                            id:'f2_label_field',
                                            emptyText : 'Input Label...',
                                            tabIndex: 1,
                                            selectOnFocus:true,
                                            fieldLabel:'Label'
                                        },  {

                                            mode:'local',
                                            name:'f2_clin_label',
                                            id:'f2_clin_label',
                                            xtype:'combo',
                                            allowBlank : false,
                                            hidden:true,
                                            autoSelect : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : false,
                                                data: [],
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                storeId:'f2_clin_list_store'
                                            }),
                                            listWidth:200,
                                            fieldLabel:'Clinical Feature',
                                            selectOnFocus:true,
                                            forceSelection : true,
                                            triggerAction : 'all',
                                            valueField:'value',
                                            displayField:'label',
                                            emptyText:'CLIN Feature...',
                                            value:'*'
                                        },
                                        { xtype:'combo', name:'f2_chr_combo',id:'f2_chr_combo',
                                            mode:'local',
                                            allowBlank : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : true,
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                data: chrom_list,
                                                storeId:'f2_chr_combo_store'
                                            }),
                                            fieldLabel:'Chromosome',
                                            valueField:'value',
                                            displayField:'label',
                                            tabIndex : 2,
                                            selectOnFocus:true,
                                            forceSelection : true,
                                            triggerAction : 'all',
                                            emptyText : 'Select Chr...',
                                            value : '*'
                                        },{xtype : 'numberfield',
                                            id:'f2_chr_start',
                                            name :'f2_chr_start',
                                            allowNegative: false,
                                            decimalPrecision : 0,
                                            emptyText : 'Input value...',
                                            invalidText:'This value is not valid.',
                                            maxValue: 250999999,
                                            minValue:1,
                                            tabIndex : 1,
                                            validateOnBlur : true,
                                            allowDecimals : false,
                                            fieldLabel : 'Start >=',
                                            value : ''
                                        },{xtype : 'numberfield',
                                            id:'f2_chr_stop',
                                            name :'f2_chr_stop',
                                            allowNegative: false,
                                            decimalPrecision : 0,
                                            emptyText : 'Input value...',
                                            invalidText:'This value is not valid.',
                                            maxValue: 250999999,
                                            minValue:1,
                                            tabIndex : 1,
                                            validateOnBlur : true,
                                            allowDecimals : false,
                                            fieldLabel : 'Stop <=',
                                            value : ''
                                        }
                                    ]},
                                {  xtype:'fieldset',
                                    defaults:{anchor:'100%'},
                                    labelWidth : 90,
                                    labelSeparator : '',
                                    title:'Association',
                                    collapsible: true,
                                    autoHeight:true,
                                    items:[
                                        {xtype : 'numberfield',
                                            id:'max_pvalue',
                                            name :'max_pvalue',
                                            allowNegative: false,
                                            decimalPrecision : 8,
                                            emptyText : 'Input value...',
                                            invalidText:'This value is not valid.',
                                            minValue:0,
                                            tabIndex : 1,
                                            validateOnBlur : true,
                                            fieldLabel : 'pvalue <=',
                                            value : 0.5
                                        },
                                        abs_value_field('Score','score',2,100,-100),
                                        abs_value_field('Correlation','correlation',0.1,1,-1),
                                        { xtype:'combo', name:'order_combo',id:'order_combo',
                                            mode:'local',
                                            allowBlank : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : true,
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                data: order_list,
                                                storeId:'order_combo_store'
                                            }),
                                            fieldLabel:'Order By',
                                            valueField:'value',
                                            displayField:'label',
                                            tabIndex : 2,
                                            typeAhead : true,
                                            selectOnFocus:true,
                                            triggerAction : 'all',
                                            value : 'floorlogged_pvalue'
                                        },
                                        { xtype:'combo', name:'limit_combo',id:'limit_combo',
                                            mode:'local',
                                            allowBlank : true,
                                            store: new Ext.data.JsonStore({
                                                autoLoad : true,
                                                fields : ['value','label'],
                                                idProperty:'value',
                                                data: limit_list,
                                                storeId:'limit_combo_store'
                                            }),
                                            fieldLabel:'Max Results',
                                            valueField:'value',
                                            displayField:'label',
                                            tabIndex : 2,
                                            typeAhead : true,
                                            selectOnFocus:true,
                                            triggerAction : 'all',
                                            value : 200
                                        }
                                    ]
                                }
                            ]
                        }]}]
                            }]
            });

    new Ext.Viewport({
        layout: {
            type: 'border',
            padding: 5
        },
        defaults: {
            split: true
        },
        items: [
            {
            region: 'north', id:'toolbar-region',
            collapsible: false,
            border : false,
            title: 'Regulome Explorer',
            split: false,
            height: 27,
            layout : 'fit',
                tbar: [
                    {
                    id:'dataMenu',
                       text:'Data',
                        labelStyle: 'font-weight:bold;',
                       menu:[{
                            text:'Export',
                           menu:[{
                           text:'CSV',
                               value:'csv',
                            handler:exportDataDialog
                           },{
                               text:'TSV',value:'tsv',
                            handler:exportDataDialog
                            },
                               {text:'SVG',value:'svg',
                           handler:showSVGDialog
                               }]
                       }]
                    },{
                        id:'displayMenu',
                            text:'Display',
                        labelStyle: 'font-weight:bold;',
                        menu:[{
                            text:'Color By:',
                            menu:[{
                                xtype:'menucheckitem',
                                 handler: colorHandler,
                                checked:true,
                                id:'feature_check',
                                group:'color_group',
                                text:'Feature Type'
                                },
                                {
                                    xtype:'menucheckitem',
                                    handler: colorHandler,
                                    group:'color_group',
                                    id:'inter_check',
                                    text:'Interestingness'
                                }]

                        },
                            {
                            text:'Rings:',
                            menu:[{
                                xtype:'menucheckitem',
                                 handler: ringHandler,
                                checked:true,
                                id:'cnvr_ring_displayed',
                                text:'CNVR tiles'
                                },
                                {
                                    xtype:'menucheckitem',
                                    handler: ringHandler,
                                    checked:true,
                                    id:'score_ring_displayed',
                                    text:'Score'
                                }]

                        }
                        ]
            },{
                        id:'modalMenu',
                        text:'Mode',
                        labelStyle: 'font-weight:bold;',
                        menu:[{
                                text:'Circular Plot',
                                menu:[{
                                            xtype:'menucheckitem',
                                            handler: modeHandler,
                                            checked:true,
                                            id:'explore_check',
                                            group:'mode_group',
                                            text:'Explore',
                                            value: 'explore'
                                        },
                                            {
                                                xtype:'menucheckitem',
                                                handler: modeHandler,
                                                group:'mode_group',
                                                id:'nav_check',
                                                text:'Navigate',
                                                value: 'navigate'
                                            }, {
                                                xtype:'menucheckitem',
                                                handler: modeHandler,
                                                group:'mode_group',
                                                disabled:true,
                                                id:'select_check',
                                                text:'Select',
                                                value: 'Select'
                    }]
                                    }]
                            }]
        },
            { region:'center',
            id:'center-panel', name:'center-panel',
            layout:'card',
            border:false,
            closable:false,
            activeItem:0,
            height: 800,
            margins: '0 5 5 0',
            items:[
                randomforestPanel
            ]
        }
        ],
        renderTo:Ext.getBody()
    });

    function colorHandler(item){
        switch(item.getId()) {
            case('inter_check'):
                 setStrokeStyleToInterestingness(); renderCircleData();
                 break;
            case('feature_check'):
            default:
                setStrokeStyleAttribute('white'); renderCircleData();
        }
    }

    function ringHandler(item){

        item.setChecked(~item.checked);
        var ring_config = {};
        ring[item.getId()] = item.checked;
        vq.events.Dispatcher.dispatch(new vq.events.Event('modify_circvis','main_menu',ring_config));
}

  function modeHandler(item){
        switch(item.getId()) {
           case('nav_check'):
                 vq.events.Dispatcher.dispatch(new vq.events.Event('modify_circvis','main_menu',{pan_enable:true,zoom_enable:true}));
             break;
            case('explore_check'):
                default:
                    vq.events.Dispatcher.dispatch(new vq.events.Event('modify_circvis','main_menu',{pan_enable:false,zoom_enable:false}));
           }
    }

export_window = new Ext.Window( {
                         id          : 'export-window',
                renderTo    : 'view-region',
                modal       : true,
                closeAction : 'hide',
                layout      : 'anchor',
                width       : 600,
                height      : 500,
                title       : "Export Image",
                closable    : true,
                tools: [{
                        id: 'help',
                        handler: function(event, toolEl, panel){
                            openHelpWindow('Export',exportHelpString);
                        }}],
                layoutConfig : {
                    animate : true
                },
                maximizable : false,
                items: {
                        xtype:'textarea',
                        id:'export-textarea',
                        name:'export-textarea',
                        padding : '5 0 0 0',
                        autoScroll:true,
                        anchor:'100% 100%'
                    }
                });
    export_window.hide();

    var e = new vq.events.Event('data_request','annotations',{});
    e.dispatch();

});

function abs_value_field(label,id, default_val,max, min) {
        var default_value = default_val || 0;
        var min_value = min || -1;
        var max_value = max || 1;
                          return {
                        xtype : 'compositefield',
                        anchor: '-20',
                        msgTarget: 'side',
                        fieldLabel: label,
                        items : [
                            {
                                //the width of this field in the HBox layout is set directly
                                //the other 2 items are given flex: 1, so will share the rest of the space
                                width:          50,
                                id:id + '_fn',
                                name :id + '_fn',
                                xtype:          'combo',
                                mode:           'local',
                                value:          'Abs',
                                triggerAction:  'all',
                                forceSelection: true,
                                editable:       false,
                                fieldLabel:     'Fn',
                                displayField:   'name',
                                valueField:     'value',
                                store:          new Ext.data.JsonStore({
                                    fields : ['name', 'value'],
                                    data   : [
                                        {name : '>=',   value: '>='},
                                        {name : '<=',  value: '<='},
                                        {name : 'Abs', value: 'Abs'},
                                        {name : 'Btw', value: 'Btw'}
                                    ]
                                }),
                                 listeners: {
                                            render: function(c) {
                                                Ext.QuickTips.register({
                                                target: c,
                                                title: '',
                                                text: 'Implies if ' + label +' value (x)=.5, Abs is a filtering of (x >= .5 OR x <= -.5) <br>Btw is a filtering of (x >= -.5 AND x <= .5)'
                                            });
                                                }
                                          }
                            },
                            {xtype : 'numberfield',
                                            id:id,
                                            name :id,
                                            allowNegative: true,
                                            decimalPrecision : 2,
                                            emptyText : 'Input value...',
                                            invalidText:'This value is not valid.',
                                            minValue:min_value,
                                            maxValue:max_value,
                                            width: 40,
                                            tabIndex : 1,
                                            validateOnBlur : true,
                                            fieldLabel : 'Range('+ label + ')',
                                            value : default_value,
                                            listeners: {
                                            render: function(c) {
                                                Ext.QuickTips.register({
                                                target: c,
                                                title: '',
                                                text: 'Numeric field with 2 decimal precision'
                                            });
                                                }
                                          }
                          }
            ]};
            }