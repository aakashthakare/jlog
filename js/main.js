document.getElementById('file-input').value = "";

document.getElementById('excTab').onclick = openTab;
document.getElementById('viewTab').onclick = openTab;

var lines;
var limit = 100;
var end = 0;
var MAX_MB = 25;

function readSingleFile(e) { 
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var fileName = file.name;
    var split = fileName.split('.');
    var extension = split[split.length - 1].toLowerCase();
    if(!(extension === 'txt' || extension === 'log' || extension === 'txt')) {
	alert("Only .log and .txt extensions are supported.");
	document.getElementById('file-input').value = "";
	return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        alert("As of now, analyzer could not process file bigger than "+MAX_MB+"MB.");
	document.getElementById('file-input').value = '';
        return;
    }
    document.getElementById("spinner").classList.remove("hidden");
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        loadLogs(contents);
        document.getElementById('tab').style.display = "block";
        document.getElementById('excTab').click();
    };
    reader.readAsText(file);
}

function loadLogs(contents) {
    var table = document.getElementById('logs');
    lines = contents.split(/\r\n|\n/);
    counter = 0;
    table.innerHTML = '';
    for (var line = 0; line < lines.length; line++) {
        addRow(line, table); end = line + 1;
        if (++counter == limit) break;
    }
    if (lines.length > limit) {
        var row1 = table.insertRow(table.rows.length);
	row1.insertCell(0);
        var cell3 = row1.insertCell(1);
        cell3.innerHTML = "<pre><input type = 'button' class = 'load-more' onclick='loadMore();' value = 'Load more...'><input type = 'button' class = 'load-more moveTop' onclick = 'window.scrollTo(0, 0);' value = 'Move to top↑' /></pre>"
    }
    document.getElementById("spinner").classList.add("hidden");
    
    var pageLinks = document.getElementById('pageLinks');
    pageLinks.innerHTML = '';
    var pages = lines.length / limit;
    for(var i = 1; i <= pages; i++) {
	pageLinks.innerHTML += "<input type = 'button' class = 'page' onclick = 'goToPage("+i+");' value = '"+i+"' />"
    }

    var expLines;
var counter = 0;
var table = document.getElementById('exc');
table.innerHTML = '';
for(var line = lines.length - 1; line > 0; line--) {
    if(lines[line].indexOf('Exception:') > 0) {
	addExceptionRow(line, table);counter++;
    }
}
document.getElementById("excCount").innerHTML = counter + "  exceptions found from the uploaded log file.";
}

function goToPage(pageNo) {
    var index = (pageNo - 1) * limit - 1;
    var table = document.getElementById('logs');
    table.innerHTML = '';

    for(var line = index; line <= index + limit; line++) {
	addRow(line, table);
    }
    
    end = index + limit + 1;
    
    if (end < lines.length) {
	var row1 = table.insertRow(table.rows.length);
	row1.insertCell(0);
	var cell3 = row1.insertCell(1);
	cell3.innerHTML = "<pre><input type = 'button' class = 'load-more' onclick = 'loadMore();' value = 'Load more...' /><input type = 'button' class = 'load-more moveTop' onclick = 'window.scrollTo(0, 0);' value = 'Move to top↑' /></pre>"
    } else {
       	var row1 = table.insertRow(table.rows.length);
	row1.insertCell(0);
	var cell3 = row1.insertCell(1);
	cell3.innerHTML = "<pre><input type = 'button' class = 'load-more' onclick = 'window.scrollTo(0, 0);' value = 'Move to top↑' /></pre>"
    }
}

function addRow(line, table) {
    if(line < 0) return;
    var row = table.insertRow(table.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var background = '';
    if (line % 2 == 0) {
        background = 'even'
    } else {
        background = 'odd'
    }
    row.classList.add(background);
    cell1.innerHTML = '<pre id="line-numbers" class= "noselect" style="color:gray;text-align: center;"><b>' + (line + 1) + '.</b></pre>';
    var processedLine = lines[line].replace(/(\w+Exception:|ERROR) (.*)/mg, '$1 <b>$2</b>');
    processedLine = processedLine.replace(/(\w+Exception|ERROR)/mg, '<b style="color:#A80000">$1</b>');
    processedLine = processedLine.replace(/\.java\:(\d+)/mg, '.java<i style="color:gray">:$1</i>');
    cell2.innerHTML = '<pre id="file-content">' + processedLine + '<br /></pre>';
}

function loadMore() {
    var table = document.getElementById('logs');
    if(end != 0) {
	var counter = 1;
	table.deleteRow(table.rows.length - 1);
	for(var line = end; line < lines.length; line++) {
	   addRow(line, table); end = line + 1;
	   if(counter++ == limit){
               break;
           }
	}
	if (end < lines.length) {
           var row1 = table.insertRow(table.rows.length);
	row1.insertCell(0);
           var cell3 = row1.insertCell(1);
           cell3.innerHTML = "<pre><input type = 'button' class = 'load-more' onclick = 'loadMore();' value = 'Load more...' /><input type = 'button' class = 'load-more moveTop' onclick = 'window.scrollTo(0, 0);' value = 'Move to top↑' /></pre>"
        } else {
       	var row1 = table.insertRow(table.rows.length);
	row1.insertCell(0);
	var cell3 = row1.insertCell(1);
	cell3.innerHTML = "<pre><input type = 'button' class = 'load-more' onclick = 'window.scrollTo(0, 0);' value = 'Move to top↑' /></pre>"
    }
    }
}

function openTab(evt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    evt.currentTarget.className += " active";

    if(evt.currentTarget.id == "excTab") {
      document.getElementById("exceptions").style.display = "block";    
    } else {
      document.getElementById("view").style.display = "block";    
   }
}

function addExceptionRow(line, table) {
    if(line <= 0) return;
    var row = table.insertRow(table.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    if (row.rowIndex % 2 != 0) {
       row.classList.add("excOdd");
    } else {
       row.classList.add("excEven");
    }
    var googleLink = "https://www.google.dk/search?q="+escape(lines[line]);
    cell1.innerHTML = '<pre id="line-numbers" class= "noselect" style="text-align:center;color:gray;"><b>' + (line + 1) + '.</b></pre>';
    var processedLine = lines[line].replace(/(\w+Exception:|ERROR) (.*)/mg, '$1 <i>$2</i>');
    processedLine = processedLine.replace(/(\w+Exception|ERROR)/mg, '<b style="color:#A80000">$1</b>');
    cell2.innerHTML = '<pre id="file-content">' + processedLine + '<b><a href="'+googleLink+'" title="Search on Google!" class="fa fa-external-link google-link" target="_blank"></a></b><br /></pre>';
}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);
document.getElementById('tab').style.display = "none";
