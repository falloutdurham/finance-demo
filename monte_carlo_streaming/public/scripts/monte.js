$(window).on("load", function() {

  var svg;
  var dataset = [];

  var width = $("section.submission").width() - 100;
  var height = 200;
  var margin = {top: 25, right: 50, bottom: 40, left: 50};

  var xScale = d3.scale.linear()
        .range([0, width])
        .domain([0, 1000])
        .nice();
  var yScale = d3.scale.linear()
        .range([height, 0])
        .domain([-3, 3])
        .nice();

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .outerTickSize(1);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .outerTickSize(0.01);

  var uuid = generateUUID();

  $.ajax({
    url: '/stocks',
    type: 'get',
    dataType: 'json',
  success: function(data) {
    data.forEach(function (stock) {
      price_and_position(stock);
    })}
  });

  $(".slider").on('input', function(vol){
    $(this).next(".position").text($(this).val());
  });

  $("#liquidity").on('click', function() {
      
      $(".submission").hide();
      $(".results").show();
      generateGraph();
      runSpark = $.ajax({
      url: '/spark',
      type: 'post',
      data: { "submission": JSON.stringify({ "uuid": uuid, "tickers": stockList(), "contacts": getContacts() })},
      dataType: 'json'      
    });

    $.when(runSpark).done(function(runSpark) {
      console.log("and we're back.");
      console.log(runSpark);

      var pollInterval = setInterval(function() {
         $.ajax({
          url: '/datapoints/' + uuid,
          dataType: 'json',
          type: 'get',
          success: function(data){ clearInterval(pollInterval); getDataSet(data); }});
      }, 300);

      // Set up interval for scanning datagrid for changes
      // set dataset and lvar
      // then generate Graph
      // generateGraph();
      //
    });
  });

  $(".position").on('input', function(evt){
    ticker =$(evt.target).parent().attr('id')
    value = filterFloat($(evt.target).text());
    if (isNaN(value)) {
      console.log('here - not number');
      $(evt.target).css('background', 'red');
    } else {
      $(evt.target).css('background', 'white');
    }
  });

  $("#symbol").on('input', function() { $("#symbol").css('background', 'white')});

  $("#add").on('click', function(evt) {
    console.log($("#symbol").text());
    var ticker = $("#symbol").text();

    var importData = $.ajax({
      url: 'import/' + ticker,
      type: 'get'
    });

    $.when(importData).done(function(){
      newRow = "<tr class='stock' id='"+ ticker + "'</tr><td class='company'></td><td class='ticker'>"+ticker+"</td><td class='stock'></td><td class='position-holder'><input type=range min=0 max=1000 value=200 class='slider' step=50><output class='position'>50</output></td>"

      $("#stocks tr.stock").last().after(newRow);
      $("#symbol").text("");
      get_name(ticker);
      price_and_position(ticker);  
    })
      .fail(function(){
        $("#symbol").css('background', 'red');
      }); 
  });

  function get_name(ticker) {
    return $.ajax({
      url: 'name/' + ticker,
      type: 'get',
      success: function(data) {
        $("#" + ticker + " .company").text(data);
      }});
  }

  function price_and_position(ticker) {
     $.ajax({
      url: 'ticker/' + ticker,
      type: 'get',
      success: function(data) {
        console.log(data);
        $("#" + ticker + " .stock").text(data);
      }});

      $.ajax({
      url: '/position/' + ticker,
      type: 'get',
      success: function(data) {
        console.log(data);
        //$("#" + ticker + " .position").text(data);
      }
    });
  }

  function filterFloat(value) {
    if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
      .test(value))
      return Number(value);
    return NaN;
  }

  function stockList() {
    stocks = [];
    $("#stocks tr.stock").each(function (idx, stock) {
        stocks.push({ "symbol": stock.id, "position": parseInt($(".position",this).text())});
    });
    return stocks;
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  function getContacts() {
    return "";
  }

  function update() {
    var dot = svg.selectAll("circle")
        .data(dataset, function(d) {return d[1]});

    dot.enter().append("circle")
        .attr({
          "class": "circle"
        , "cx": function(d) { return xScale(d[0]); }
        , "cy": function(d) { return yScale(d[1]); }
        , "r": function(d) { return 1; }
        })
        .style('fill', 'blue')
        .style('opacity', 1)
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }


  function getDataSet(data) {
    return data;
    //return [2.2,2.3];
    return [-68.24651457827537,-63.45489242874701,-58.94659760658307,-58.02714689398194,-55.573545971747556,-54.73569306742579,-53.27629489436663,-51.22606636161868,-50.35105513597779,-50.11328541640579,-48.73346418895421,-46.84630023012784,-45.91635399933487,-45.30301640470868,-43.9642488573142,-43.14851117922704,-42.82347693900607,-41.8037788801442,-41.59551887917468,-40.94836989400357,-39.80488260424299,-39.59634408739925,-39.36861347492212,-38.557685725283314,-38.41179830838283,-38.30277408465458,-37.79257419290571,-37.37231431243542,-37.24180668285469,-37.10840514813326,-37.06064802587214,-36.48153609612479,-36.3840323259052,-36.167960413305174,-35.937147657421335,-35.82970055478429,-35.18148883078661,-34.91545111233196,-34.82187130742331,-34.505055094523044,-34.421155399917055,-33.91626828453768,-33.831240112639435,-33.58715093462636,-33.4243858025319,-33.37295771752105,-33.23087193203254,-33.09977563486506,-32.676071032090604,-32.66553069733836,-32.54507179787458,-32.07443553859321,-31.82276752998726,-31.754414875895645,-31.727005023887216,-31.506149900591126,-31.405162599154515,-31.249240551431086,-31.124575324396957,-30.991953418136397,-30.496328823107582,-30.39868128139988,-30.29118960034922,-30.23021579150446,-29.940266803251706,-29.773709886133346,-29.513068252995524,-29.276115582810004,-29.1841184146461,-29.045778622563404,-29.03435537788503,-28.891316970400066,-28.797844197549693,-28.755059272982535,-28.72403138220504,-28.66046464764035,-28.593399881062535,-28.247843976800212,-28.163647190753494,-27.936730949523735,-27.66551306376754,-27.32279512080787,-27.159086338380785,-27.083165041224238,-26.956503420372968,-26.90007414213566,-26.79600250456077,-26.718680128156837,-26.650579808531802,-26.49742115529523,-26.397723580477763,-26.36726958579237,-26.27491470404243,-26.144765076433615,-26.122994304032858,-26.01809608621137,-25.638510918522993,-25.573697128706165,-25.465915278857835,-25.16818508814938,-25.030569404266632,-24.974118159423064,-24.915407237071857,-24.872929432965357,-24.831818884730364,-24.72535453103668,-24.51131203361396,-24.308453158190822,-24.26271285961188,-24.025927976161327,-23.931064291527555,-23.803819339097878,-23.764192535636052,-23.571030998494535,-23.470200834777668,-23.305664925390232,-23.173190781547817,-23.114900992716215,-23.048832036188607,-23.036809540486576,-23.021743248938083,-22.94106735441177,-22.903422724891353,-22.84001909295419,-22.818489462414618,-22.786179063811392,-22.74169832542941,-22.533331086239084,-22.465581655246513,-22.287924655572873,-22.17552268083154,-22.05147877757247,-21.893271876877368,-21.845397414295896,-21.7756263570362,-21.649511375269086,-21.542896127565786,-21.446701856104237,-21.36600534494604,-21.321058351693885,-21.26298897753781,-21.20232513967416,-21.119692477255523,-21.00754611961214,-20.943551728705998,-20.926150968100508,-20.66741938677395,-20.592217834771557,-20.535006877544944,-20.441416194616725,-20.22617244821194,-19.93394431682548,-19.749022975017567,-19.731498895907635,-19.703889928789287,-19.69007273711329,-19.580924615396878,-19.548730878072405,-19.430639834500287,-19.289335500776385,-19.24687015935331,-19.040455710794394,-19.015072598518845,-18.761209519848737,-18.73715347871196,-18.639626360483927,-18.44817601107021,-18.37973336958744,-18.3067032695748,-18.265196387516266,-18.239171209343926,-18.167568223636728,-18.08167921821248,-18.074833768385716,-17.887649373702185,-17.76178812927005,-17.740090900830005,-17.639865074240753,-17.590226753260875,-17.53958447445499,-17.519559099547422,-17.440560159494666,-17.34031430098071,-17.07196986575227,-17.008172067536947,-16.965930852455877,-16.936714122632655,-16.90729548534736,-16.840492995415588,-16.799326895568193,-16.722709754582212,-16.67504217366367,-16.671488278228264,-16.648734397854533,-16.60577865374979,-16.575318242925487,-16.50884762750108,-16.44334807238802,-16.401003513679587,-16.342568904577693,-16.263704877962965,-16.10925043417064,-16.05158341849553,-15.978985002039297,-15.923565630060523,-15.890323327195988,-15.817631960417126,-15.759468411016192,-15.729467034596274,-15.471206833914653,-15.31973067823768,-15.26450899997099,-15.234054126161723,-15.209241231022816,-15.119126467867698,-15.076119719150446,-15.064325148137632,-15.039797829895122,-14.931591975687285,-14.855175442506557,-14.741379308556718,-14.737728695920996,-14.607044049377697,-14.582245501352762,-14.487214140959605,-14.378069314511336,-14.294970633717337,-14.204854768084974,-14.17608270109262,-14.067529770816368,-13.764410402988485,-13.679610547914503,-13.658172689223452,-13.474026094219763,-13.199947595101214,-13.108298834202618,-13.100002210707153,-13.083232606634198,-13.001800766561193,-12.989505577178742,-12.908364838474288,-12.819148049904848,-12.7685730481675,-12.601819471441093,-12.56169413245596,-12.549622357182852,-12.451535688023204,-12.369356913008518,-12.286659701687652,-12.281355113688488,-12.191411932764096,-12.175053850014208,-12.151698443582248,-12.118578385692256,-12.073716188824053,-11.983796389778576,-11.950865278160997,-11.776614529574314,-11.757774923491665,-11.691669960458816,-11.60136990734727,-11.482270809269409,-11.47574746824348,-11.382811936164037,-11.361399145870564,-11.31071263151148,-11.245132302077542,-11.221045300049417,-11.179003282153326,-11.147127421053527,-11.026435430909427,-10.928246769730196,-10.904621766796229,-10.594749006369184,-10.539951339291921,-10.290284541693966,-10.258767929739959,-10.052894721641994,-10.01384400823092,-9.97817439996592,-9.855035193380507,-9.799642995568922,-9.735584940261743,-9.648637309371317,-9.571180902934097,-9.549060081973451,-9.501728063760474,-9.486206933238797,-9.442087324467908,-9.430366896642385,-9.389317886899589,-9.28869618711283,-9.25129445915284,-9.201137551697522,-9.14018900081355,-9.12620910958852,-9.10987342423342,-9.095445982789576,-9.051419371372122,-9.02583245754963,-9.00366812109636,-8.979430487437485,-8.954424985615379,-8.899433501511709,-8.86243851691387,-8.848440493373898,-8.78604697230012,-8.756944824047928,-8.608122186100795,-8.544254860601479,-8.469045672115996,-8.286789753729387,-8.247420964375637,-8.211560579113987,-8.146185185520704,-8.127114252450465,-8.089856148866856,-8.040491636282303,-8.00188601480516,-7.936261477071415,-7.769526094725665,-7.7516623049997015,-7.708891367060081,-7.696586049971575,-7.648341215776891,-7.639007119944235,-7.534971387577075,-7.516055233178001,-7.458463504652096,-7.400789799596876,-7.365097389491159,-7.35396703575541,-7.339304274963938,-7.322216358991534,-7.292706828066387,-7.267855117972824,-7.231435474221612,-7.094472672843801,-7.068285086445979,-7.064290946400178,-7.046821939169538,-6.988440480644278,-6.956166505553857,-6.922195081067312,-6.881968562997611,-6.851874823350454,-6.82988073668559,-6.810100384747306,-6.690659945162861,-6.450862535198345,-6.391935998491361,-6.321704934123744,-6.31868911781773,-6.311549557999285,-6.264806326599916,-6.150979402804737,-6.13398276372428,-5.964170587813299,-5.923537440338485,-5.912772158117938,-5.907693437796871,-5.774729700124816,-5.748480394554791,-5.620485258255926,-5.489452927227501,-5.353822653588666,-5.347079052153118,-5.285115083687752,-5.190596326703232,-5.1437656449645806,-5.072739488526318,-4.981062962931509,-4.966843076248298,-4.8880368244368535,-4.813278956545773,-4.784715914499083,-4.744319930535154,-4.724768323576145,-4.616180670557135,-4.569010006900526,-4.545081794353581,-4.367943438915435,-4.350319194678667,-4.331567823040165,-4.278913852218632,-4.260430543164286,-4.232845188404976,-4.182708983941133,-4.150690168444729,-4.053725345695632,-3.981608042757901,-3.9235675427450647,-3.903333845994343,-3.8308489381219237,-3.8174016912463826,-3.7924317572773045,-3.7763141973676375,-3.719296506024431,-3.5028877702122596,-3.483396028194295,-3.463153593899789,-3.3981559368570355,-3.322205653831321,-3.242808742054682,-3.1910209144737696,-3.157122841667012,-3.0752627044410077,-2.9744061459832407,-2.760369490457375,-2.696237637186669,-2.6326128412008845,-2.5875755665844764,-2.540058826921178,-2.5288892329453136,-2.495807970217187,-2.484497401153508,-2.447318841930908,-2.340426520563908,-2.3049374230470985,-2.2650984448589653,-2.2431100237145083,-2.1785379883206506,-2.149053176451873,-2.1321299293332165,-2.0255549739549705,-2.003516576237094,-1.9601619041767502,-1.8858810893428384,-1.8756282139647418,-1.834028262443546,-1.6890248854052987,-1.6775037125928505,-1.6167417195743496,-1.5999198309980605,-1.5732986758270653,-1.5167374112889456,-1.4225724013129328,-1.3916526780398377,-1.3665764503963724,-1.343717106319227,-1.3289176270495222,-1.2609048160869478,-1.1591240563892298,-1.0833662002222437,-0.9987651902111161,-0.9153105182951006,-0.8721126515233127,-0.8490912234720859,-0.8251641545874548,-0.800276658154297,-0.7052625531951238,-0.6581040201916215,-0.654623206250619,-0.6418734308766653,-0.6033859357896876,-0.4894433055069102,-0.421988876185724,-0.3071374991778373,-0.19072813104790742,-0.18471559601429066,-0.12424987541877486,-0.0879416785225211,-0.048823746131677614,0.007781400332376842,0.21171778854510337,0.22795625718254864,0.23054562143851354,0.32541380164235234,0.33934282401457616,0.34888021893664445,0.4301622794172473,0.49116944825449077,0.5549696977944827,0.6212877469443463,0.6431310049453872,0.6795624967288967,0.7287263507635297,0.7586958141204707,0.7853814415264987,0.85440559001592,0.8746174754465531,0.9508779725775989,1.0453214309439014,1.060664534102483,1.1295874932222698,1.2707444700351211,1.3222250285061494,1.3652029517446205,1.388471662697698,1.445124550366352,1.637469695119484,1.6679870273687054,1.6824753982457006,1.7158456538308302,1.7536786801959179,1.8920211290865423,1.9669832729101342,2.006402411793153,2.0199914482196775,2.142743652469951,2.209066413309973,2.26345283235955,2.274251208587436,2.2862042228787085,2.320296050539997,2.3701608994049517,2.4079712366074397,2.4354929479049696,2.513605369702812,2.6017773110916966,2.678407477143546,2.720150433682724,2.7339145213858393,2.7691488554825767,2.7823863276714453,2.7942003223784564,2.8917629147577393,2.92710836485474,2.9490057105317953,2.9662658088065026,3.064714394121474,3.0692713730890855,3.2008621718627444,3.2106077604316625,3.219730697625848,3.27130879903227,3.3253598169114436,3.3455490787456426,3.4123500943260257,3.4563446815477326,3.5353883198049045,3.5571057861903776,3.6038917497999408,3.615562874346685,3.631576964648565,3.667139412342423,3.81898451393958,3.8450157165628074,3.8696040810067895,3.8852088849956186,3.895215844843488,4.00581226295467,4.045762205373169,4.0588944373455105,4.082995734819344,4.265137408744972,4.31755769348802,4.398038484933217,4.644704408370784,4.753998758115086,4.835519733628065,4.857187256921764,4.900772618217518,4.9435382172588405,4.979621124547069,5.0850093212260585,5.108030398636796,5.130140475771914,5.1335959869223045,5.150471759025885,5.188709537207119,5.2210867192347905,5.278172531248201,5.348747088000033,5.526390136428839,5.531886913842541,5.601990684996624,5.631069020011447,5.652893798898581,5.675874106505974,5.77537075085431,5.7934727271208635,5.873760222670879,5.899898154764387,5.970804584037692,5.996455008016191,6.043530344253053,6.180368311398377,6.200681869594554,6.264729598810952,6.336740731064829,6.3663358985285186,6.604509702983609,6.629377418820206,6.721681836936625,6.847807309050658,6.8796214368642294,6.900451860319119,6.926685882612995,6.957207868135208,6.973976716100701,7.009906420380945,7.085170363255834,7.177579392603475,7.264474076935519,7.299827053379094,7.317011608070096,7.321342392882753,7.327578448681327,7.395549018691815,7.547502045482854,7.628452111876203,7.648972827404326,7.708616394649022,7.765908853882386,7.784121213160783,7.80949488336369,7.894082142145322,7.981943699054628,8.000833973921424,8.016845332822232,8.11820561381436,8.154541605203212,8.220554632102335,8.29425036753511,8.37713511391674,8.379985199754403,8.427992132538435,8.508166288388855,8.592235600669433,8.624226997795585,8.65847074456369,8.673426406625023,8.728079722748255,8.818112790744797,8.85678169529244,8.886595254572892,8.914262584602776,8.919309318217481,8.929848388521037,9.108720190180701,9.122887202675699,9.341256120717823,9.369622167254672,9.429417283129531,9.457828996120194,9.50748073386059,9.528387362126708,9.637160200801198,9.76797007774974,9.835411237200468,9.889759467162786,9.970203194514308,10.06235137153162,10.087047027957684,10.188649656822413,10.205757874492258,10.258284681555496,10.339627787657697,10.360695425096576,10.395045201609888,10.434133693618861,10.442584770950667,10.506673130784312,10.529684277526155,10.645741959970618,10.667928244733938,10.70666834494824,10.78833136533764,10.836342611824834,10.864848258492653,10.876894901039392,10.933165408407397,10.94254750444558,10.956367979940985,11.015877890021052,11.024510673200641,11.041432778842058,11.095033118821341,11.142692102339605,11.203603896745072,11.264446757326489,11.360378525761176,11.555561682878782,11.57709771147151,11.680956390550786,11.706717059803616,11.722348805235558,11.808010725449751,11.836299157250089,11.875004303619917,11.932829574002545,12.035777764312257,12.039644336181853,12.074812520228079,12.137928063357421,12.20300090886322,12.251647266918301,12.297013462219216,12.364136060478096,12.367441869604143,12.456371171972345,12.468095840965656,12.52865949173873,12.538305592449916,12.561727330617618,12.666848465019182,12.80187983361745,12.844260461385016,12.866805452314946,12.90270431221792,12.93748475990268,12.983072656878976,13.112333994357233,13.1905045963646,13.22076430139507,13.249142240196333,13.28768778840534,13.333179740860622,13.53538426580645,13.879636671718028,13.922973334159984,13.995087297359737,14.021974713222848,14.129040647897153,14.201820729460174,14.276553742864296,14.424712180577721,14.474975898119101,14.643355966838493,14.730396497913484,14.77524366727227,14.98757867777346,15.019524661795709,15.123317047255933,15.160494201359185,15.230389002728263,15.338376488024771,15.433935875657145,15.565518102840958,15.600773915375433,15.640329700970977,15.702382733222924,15.741897321539405,15.768958574619692,15.90206554281878,15.96827757121265,16.079029804610947,16.112482243563676,16.144466515038346,16.158752159877267,16.2249561878864,16.294530401565652,16.34668583427561,16.45755060506295,16.567050334831876,16.62927890006917,16.677139662236858,16.70594991956611,16.715795227489462,16.77932830160733,16.790845962946207,16.914391326085777,16.99004969618202,17.029829041586307,17.16919657202465,17.23631457383476,17.251714225547357,17.285915627919,17.347559355430974,17.39677416116011,17.404237644567,17.45899885512456,17.549786135094607,17.589587717547477,17.62400049440164,17.636867562537144,17.70429031087911,17.73472854714872,17.767369591876683,17.8993151947609,18.04125429171564,18.092413631129123,18.14161259481575,18.17362336926188,18.1787857633359,18.286773454179507,18.34915852803359,18.40961982430742,18.441175806203937,18.49399936981323,18.613621091584243,18.640367277345003,18.686835288523923,18.775399114603868,18.86978772787497,18.908943843379745,18.92243688271727,19.064188297390224,19.202649189175936,19.24631569906183,19.38220510161019,19.414329837490037,19.444208915769387,19.52413750922765,19.73426126508901,19.76481498138453,20.233374054170667,20.27310806038917,20.298044542226066,20.352723684681564,20.48020718457527,20.516120675065437,20.608426605137545,20.656689349182393,20.662777586877045,20.79212781910041,20.905741348787746,20.95212444146845,20.99979540574563,21.044297922624267,21.097763791381254,21.12663833863831,21.18716958602551,21.29361380004431,21.45462798680027,21.475820367338248,21.58716272037289,21.6556320544639,21.751221764394035,21.84057559174664,21.920548722832887,21.987475375126337,22.20422090174569,22.285608493697417,22.408956900506926,22.444341052602137,22.561565211953884,22.572387134677093,22.660779801079237,22.73729317064158,22.78719015402983,22.835335959172323,22.983420087489176,22.989977804675043,23.16442867468077,23.26064352188356,23.313540445688766,23.327825604424973,23.383412130889585,23.622571928647183,23.64971023348287,23.65396836913247,23.683014127527574,23.875676290208432,23.917301794751122,23.96535575795783,24.11732957995655,24.25456709978068,24.385860202482892,24.429842931945597,24.709211596570775,24.77865879500711,24.892543250514137,24.937542774721578,24.980496289993305,25.021734585702205,25.042630131738882,25.090119761256794,25.141385581872935,25.18096920798182,25.43706491739858,25.538454293322374,25.541263607582152,25.63505576370407,25.791560468231005,25.838969789557865,25.862660913511466,26.174974542304973,26.19588429736334,26.367083900596246,26.630265320302257,26.69220967851518,26.792740645324166,26.885926039238857,27.01090180180569,27.11714379739935,27.131245750097126,27.16587555840379,27.23006425130452,27.25176359773424,27.293612659668785,27.540273331194108,27.938798189862098,28.10163132821742,28.182820883992107,28.216361784788134,28.30123683524777,28.540187728842252,28.654319272198382,28.68037627153046,28.735083302149548,28.76624228422757,28.818740700033363,28.87589906519857,29.155856244234656,29.209081220737897,29.426279378492715,29.44305241219174,29.825706635445634,30.076826388866067,30.150994757505476,30.24430464475318,30.558777339490902,30.729917033889564,30.97899693603324,31.038782599942373,31.359448905132147,31.54326411844075,31.596324211782708,31.618514013568493,31.635346384666043,31.68056658188084,31.853478493199002,32.17260805558615,32.25528313151305,32.321105813262754,32.353339239452325,32.389223144837956,32.755611293205185,32.780630408426184,32.79582977477838,32.89942444063541,33.0304514337927,33.12810994479646,33.431248848563065,33.5879260591358,34.12653281726954,34.31269640989696,34.3551015183553,34.622128022464324,34.635755872513464,35.136226985775615,35.329330623618475,35.50949528230381,35.77958975212817,35.96180754439797,36.19724885616389,36.27465664706658,36.51683671207055,36.83933358533129,37.18843797967425,37.215872707914556,37.29264599988401,37.70446390615347,37.76944741548659,37.93560203560831,38.17181771248771,38.24530702547458,38.61620945385649,38.754019694817,38.894837927369075,39.00508113402526,39.06793290531327,39.83418061572934,40.07844859463377,40.247104099070654,40.26042310212108,40.46010227622788,40.56385799833516,40.71803541405794,40.89565615949763,41.004624903623245,41.082786660023494,41.46998580938012,41.803257326909915,42.041201829022384,42.16469881225429,42.46272476397519,42.80033136417674,42.87301273837641,43.23758664923372,43.60220757125558,43.79115380500175,43.90696198001709,44.55682186642101,44.65337901144582,45.11610384475253,46.04992179575574,46.20016728478498,46.96555096407079,47.301547212369904,47.372007461520056,47.6553114233958,48.02296031995275,48.65045545111292,49.22986962818966,49.28924371507989,49.41736074168812,49.43623317125529,49.67505850588764,49.931447275741355,50.437290934945466,50.61819739975938,50.95276897553996,51.16229823488945,51.52097703772004,52.342706178501594,54.960458175116834,57.62747066869163]
  }

  function generateGraph(data) {

    var initialDataset = shuffle(data);
  
    yScale = d3.scale.linear()
          .range([height, 0])
          .domain([d3.min(initialDataset), d3.max(initialDataset)])
          .nice();

    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .outerTickSize(1);

    svg = d3.select("section.results").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svgXaxis = svg.append('g')
        .attr({
          'class': 'axis label'
        , 'transform': 'translate(0,' + height + ')'
        })
        .call(xAxis);

    svgXaxis.append('text')
        .attr({
          'class': 'label'
        , 'x': width / 2
        , 'y': margin.bottom - 4
        , 'text-anchor': 'middle'
        })
        .text('simulations');

    var svgYaxis = svg.append('g')
        .attr({
          'class': 'axis label'
        })
        .call(yAxis);

    svgYaxis.append('text')
        .attr({
          'class': 'label'
        , 'transform': 'translate(-290,320)rotate(-90)'
        , 'x': margin.left
        , 'y': height / 2
        , 'text-anchor': 'middle'
        })
        .text('LVaR loss ($)');

    update();

    // add new data
    var count = 0;
    var lvar_loss = -32.66553069733836;
    var interval = setInterval(function() {
      var d = [count, initialDataset[count]]
      dataset.push(d);
      update();
      count++;
      if (count >= initialDataset.length) {
        clearInterval(interval);
        lvar = svg.selectAll("circle")
                  .data(dataset, function(d) {return d[1]})
                  .select(function(d, i) { return  d[1]== lvar_loss ? this: null; })
                  .attr({"r": function(d) {return 5;}}).style('fill', 'red')
      }
    }, 10);
  }
});
