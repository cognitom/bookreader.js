/* Copyright 2008 CogniTom Academic Design & Tsutomu Kawamura
 * http://bookreader.cognitom.com/
 * office@cognitom.com
 * ------------------------------------------------------------------
 *
 * bookreader
 *
 * - version 0.8.1
 * - release 2009.2.22
 * 
 * ------------------------------------------------------------------
 * 本スクリプトは、Apache License Version 2.0に基づいてライセンスされます。
 * あなたがこのファイルを使用するためには、本ライセンスに従わなければなりません。
 * 本ライセンスのコピーは下記の場所から入手できます。
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * 適用される法律または書面での同意によって命じられない限り、本ライセンスに基づい
 * て頒布されるソフトウェアは、明示黙示を問わず、いかなる保証も条件もなしに「現状
 * のまま」頒布されます。本ライセンスでの権利と制限を規定した文言については、本ラ
 * イセンスを参照して下さい。
 * ------------------------------------------------------------------
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var brContainers = [];
var brContainer = function(el){
	this.initialize = function(el){
		var prt = el.parentNode;
		var iframe = document.createElement('iframe');
		iframe.id = 'brContainer_'+id; div.className = 'brContainer';
		prt.insertBefore(iframe,el);
		
		this.elOriginal = el;
		this.elBookReader = iframe;
		this.idx = brContainers.length;//配列の要素番号
		brContainers.push(this);//グローバル配列に登録
	};
	this.deactivate = function(){
		this.elBookReader.style.display = 'none';
		this.elOriginal.style.display = 'block';
	};
	this.activate = function(){
		this.elBookReader.style.display = 'block';
		this.elOriginal.style.display = 'none';
	};
	
	this.initialize(el);//コンストラクタ呼び出し
};

var brObjects = [];//クラスオブジェクトの格納用。主にthisをバインドする目的で、全クラス共通で使用。
var BookReader;//brBookシングルトン
var brBook = function(renderer, effect){//Singleton
	this.initialize = function(renderer, effect){
		if (BookReader){
			return BookReader;
		} else {
			BookReader = this;
			
			this.cp = 0;
			this.nowUpdating = false;
			
			this.renderer = renderer;
			this.effect = effect;
			
			this.navigation = new brNavigation();
			this.toolbar = new brToolbar();
			this.sidebar = new brSidebar(document.getElementById('sidebar'));
			this.suppressKeyEvent = false;
			
			this.divError = document.createElement('DIV'); this.divError.id = 'br_error';
			this.divBody = document.createElement('DIV'); this.divBody.id = 'br_body';
			this.divNavigation = this.navigation.element; this.divNavigation.id = 'br_navigation';
			this.divToolbar = this.toolbar.element; this.divToolbar.id = 'br_toolbar';
			this.divSidebar = this.sidebar.element; this.divSidebar.id = 'br_sidebar';
			this.source = document.getElementById('bookreader');
			
			this.prepare();
			this.update();
		}
	};
	this.console = function(str){
		this.divError.innerHTML += '<p>'+str+'</p>';
		//this.divSidebar.innerHTML += '<p>'+str+'</p>';
	};
	this.prepare = function(){
		document.body.appendChild(this.divBody);
		document.body.appendChild(this.divNavigation);
		document.body.appendChild(this.divSidebar);
		document.body.appendChild(this.divToolbar);
		
		this.renderer.setCanvas(this.divBody);
		this.renderer.parse(this.source);
	};
	this.update = function(){
		if (this.nowUpdating) return;
		this.nowUpdating = true;
		this.renderer.update();
		scrollTo(30,0);
		this.nowUpdating = false;
		//ナビゲーションボタン
		this.navigation.prev.fadeIn();
		//NEXTボタンだけ瞬かせる (2ページ以上ある場合)
		if (BookReader.renderer.pageLength <= 1) this.navigation.next.fadeIn();
			else this.navigation.next.blink();
			
		this.sidebar.appear();
		
		this.toolbar.appear();
		this.toolbar.fadeOut();
		
	};
	this.go2anchor = function(anc){//ページ内ジャンプ
		if ((anc = anc.replace('#','')) && this.anchors[anc]){
			setTimeout("BookReader.go2page("+this.anchors[anc]+")",500);
		}
	};
	//this.go2prev2 = function(){ this.go2page(this.cp-brTheme.columns); };
	this.go2prev = function(){ this.go2page(this.cp-1); };
	this.go2next = function(){ this.go2page(this.cp+1); };
	//this.go2next2 = function(){ this.go2page(this.cp+brTheme.columns); };
	this.go2first = function(){ this.go2page(0); };
	this.go2last = function(){ this.go2page(this.renderer.pages.length-1); };
	this.go2page = function(p){
		this.cp = p;
		if (this.cp < 0){ this.cp = 0; this.effect.go2end(0); } 
			else if (this.cp > this.renderer.pages.length-1){ this.cp = this.renderer.pages.length-1;　this.effect.go2end(this.cp*(brTheme.page.width+1));　}
				else this.effect.go2(this.cp*(brTheme.page.width+1));
		this.toolbar.updatePagerBalloon();
	};
	this.escape = function(){
		alert('未実装');
		window.close();
	};
	this.keydown = function(e){
		if (this.modkeydown){
			this.modkeydown = false;
			return true;
		}
		
		if (this.suppressKeyEvent) return false;
		this.suppressKeyEvent = true;
		setTimeout("BookReader.suppressKeyEvent=false", 30);
		
		var flag = true;
		var c = (e.charCode) ? e.charCode : e.keyCode;
		switch (c){
			case 63232: case 63276: case 38: case 33: case 66: this.go2prev(); break;//[↑]/[B]
			case 63233: case 63277: case 40: case 32: case 34: this.go2next(); break;//[↓]/[space]
			case 63234: case 37: case 80: this.go2prev(); break;//[←]/[p]
			case 63235: case 39: case 78: this.go2next(); break;//[→]/[n]
			case 63273: case 36: this.go2first(); break;//[home]
			case 63275: case 35: this.go2last(); break;//[end]
			case 16: case 17: case 18: case 91: this.modkeydown = true; flag = false; break;
			default: flag = false;
		}
		if (flag){
			if (e.preventDefault) e.preventDefault();
			else {
				event.returnValue = false;
			}
			return false;
		} else {
			return true;
		}
	};
	this.keyup = function(e){
		var c = (e.charCode) ? e.charCode : e.keyCode;
		switch (c){
			case 16: case 17: case 18: case 91: this.modkeydown = false; break;
		}
	};
	this.resize = function(e){
		//TODO:イベントの発生頻度を抑制するコードを追加
		this.renderer.resize();
	};
	this.scroll = function(e){
		if (this.effect.scroll())
			this.toolbar.updatePagerBalloon();
	};
	
	this.initialize(renderer, effect);//コンストラクタ呼び出し
};

/* レンダラ */
var brRenderer = function(){//日本語用
	this.initialize = function(){
		this.canvas = null;
		this.lines = [];
		this.pages = [];
		this.anchors = [];
		//settings
		this.kinsokuOkuri = '「『（〈〝([{';//禁則処理で次行に送る文字
		this.kinsokuModoshi = '。、」』）〉〟.,!)]}';//禁則処理で前行へ戻す文字
		this.asyncTriger = 80;//非同期モードを開始する行数
		//private
		this.sampler = null;
		this.parsingElement = null;
		this.maxLine = 0;
		this.elmStack = [];//解析中のエレメントのスタック
		this.curPos = 0;//BOX左端からの距離(px)
		this.asyncMode = false;
	};
	this.clearPages = function(){
		this.pages = [];
		for (var i=this.canvas.childNodes.length-1;i>-1;i--)
			if (!this.canvas.childNodes[i].id || this.canvas.childNodes[i].id != 'br_sampler')
				this.canvas.removeChild(this.canvas.childNodes[i]);
	};
	this.clearLines = function(){
		this.lines = [];
	};
	this.setCanvas = function(elm){
		var page,box;
		
		this.canvas = elm;
		this.clearPages();
		
		//以下、サンプラーの準備
		page = document.createElement('DIV');
		page.id = 'br_sampler';
		page.className = 'page';
		box = document.createElement('DIV');
		box.className = 'box';
		page.appendChild(box);
		this.canvas.appendChild(page);
		this.sampler = box;
	};
	this.parse = function(src){//ソースとなる文書の解析。行の分割はここで行う
		this.clearLines();
		
		if (src.firstChild){
			this.parsingElement = src.firstChild;
			while (!this.asyncMode && this.parsingElement){
				this.processElement(this.parsingElement, true);
				this.parsingElement = this.parsingElement.nextSibling
			}
			if (this.parsingElement)
				this.parseAsync();
		}
	};
	this.parseAsync = function(){
		this.processElement(this.parsingElement, true);
		if (this.parsingElement = this.parsingElement.nextSibling)
			setTimeout('BookReader.renderer.parseAsync();', 200);
		else
			this.update();
	};
	this.update = function(){//表示内容の更新。ロード時と、リサイズ時に。
		var box, boxHeight, max, n, tagName, lineSpacing, bodyWidth;
		
		boxHeight = brWindowHeight() - brTheme.page.marginTop - brTheme.page.marginBottom - brTheme.page.paddingTop - brTheme.page.paddingBottom;
		max = Math.floor(boxHeight / brTheme.lineHeight);
		n = 0;
		this.clearPages();
		box = this.addPage();
		for (var i=0; i<this.lines.length; i++){
			tagName = this.lines[i].tagName.toUpperCase();
			switch (tagName){
				case 'H1':
				case 'H2':
				case 'H3':
				case 'P':
					lineSpacing = brTheme.blockElements[tagName].lineSpacing;
					if (n > 0 && n+lineSpacing > max){
						box = this.addPage();
						n = 0;
					}
					box.appendChild(this.lines[i]);
					n += lineSpacing;
					break;
				case 'IMG':
					lineSpacing = Math.ceil(this.lines[i].style.height / brTheme.lineHeight);
					if (n > 0 && n+lineSpacing > max){
						box = this.addPage();
						n = 0;
					}
					box.appendChild(this.lines[i]);
					n += lineSpacing;
					break;
				case 'HR':
					box = this.addPage();
					n = 0;
					break;
			}
		}
		
		this.updateBodyWidth();
		for (var i=0; i<this.pages.length; i++){
			this.canvas.appendChild(this.pages[i]);
		}
		BookReader.toolbar.updatePager(this.pages.length);
		this.maxLine = max;
	};
	this.resize = function(){
		boxHeight = this.getBoxHeight();
		max = Math.floor(boxHeight / brTheme.lineHeight);
		if (this.maxLine != max)
			this.update();
		else {
			this.updateBodyWidth();
			BookReader.scroll();
		}
	};
	this.updateBodyWidth = function(){
		if (isIE) document.body.style.width = ((this.pages.length-1)*(brTheme.page.width+1) + brWindowWidth() + 30*2)+'px';
			else this.canvas.style.width = ((this.pages.length-1)*(brTheme.page.width+1) + brWindowWidth() + 30*2)+'px';
	};
	this.addPage = function(){
		var el, box;
		el = document.createElement('DIV');
		el.className = 'page';
		box = document.createElement('DIV');
		box.className = 'box';
		folio = document.createElement('DIV');
		folio.className = 'folio';
		folio.innerHTML = (this.pages.length+1);
		el.appendChild(box);
		el.appendChild(folio);
		this.pages.push(el);
		return box;
	};
	this.appendLine = function(){//行の追加
		var tagName, el, el2;
		this.curPos = 0;
		for (var i=0; i<this.elmStack.length; i++){
			tagName = (this.elmStack[i].nodeName == '#text') ? 'P' : this.elmStack[i].tagName;
			el = document.createElement(tagName);
			if (i==0){
				this.lines.push(el);
				el2 = el;
			} else {
				el2 = el2.appendChild(el);
			}
		}
		
		if (this.lines.length == this.asyncTriger){
			this.update();//内容量が多い時に、最初のページだけ先に表示しておく。
			this.asyncMode = true;//以降は非同期モードで解析
		} else if (this.lines.length > this.asyncTriger && this.lines.length % this.asyncTriger == 0){
			this.update();
		}
		
		if (this.sampler.firstChild)
			this.sampler.removeChild(this.sampler.firstChild);
		this.sampler.appendChild(el);//エレメントのサイズを測るためにdocumentツリーに組込む
		return el;
	};
	this.processElement = function(elm, newline) {//指定幅ごとに(禁則処理あり)、文字列を分割する
		var focus, child, n, bW;
		this.elmStack.push(elm);
		
		if (elm.nodeName != '#text'){
			if (newline){
				focus = this.appendLine();
			}
			bW = this.getBoxWidth();//BOX幅
			for (var i=0; i<elm.childNodes.length; i++){
				child = elm.childNodes[i];
				switch (child.nodeName){
					case '#text':
						n = 0;
						text = document.createTextNode('');
						focus.appendChild(text);
						while (n < child.nodeValue.length){
							text.nodeValue += child.nodeValue.substr(n,1);
							if (focus.offsetWidth > bW
								&& this.kinsokuModoshi.indexOf(child.nodeValue.substr(n,1)) == -1){//禁則処理
								text.nodeValue = text.nodeValue.substr(0, text.nodeValue.length-1);
								while (this.kinsokuOkuri.indexOf(child.nodeValue.substr(n-1,1)) > -1){//禁則処理
									text.nodeValue = text.nodeValue.substr(0, text.nodeValue.length-1);
									n--;
								}	
								//BookReader.console(focus.offsetWidth);
								focus = this.appendLine();
								text = document.createTextNode('');
								focus.appendChild(text);
							} else {
								n++;
							}
						}
						//BookReader.console(focus.offsetWidth);
						break;
					case 'BR':
						focus = this.appendLine();
						break;
					default:
						this.processElement(child);
						break;
				}
			}
		}
		
		
		this.elmStack.pop();
	};
	this.getBoxHeight = function(){
		return brWindowHeight() - brTheme.page.marginTop - brTheme.page.marginBottom - brTheme.page.paddingTop - brTheme.page.paddingBottom;
	};
	this.getBoxWidth = function(){
		return brTheme.page.width - brTheme.page.paddingLeft - brTheme.page.paddingRight;
	};
	
	/* 以下の古い関数は使用しない。参照用にのみ残しているが、近々に削除すること */
	this.addLine = function(tagName, text, attrs){//行の追加
		var el = document.createElement(tagName);
		if (text) el.innerHTML = text;
		//TODO: 属性値の処理
		this.lines.push(el);
		return el;
	};
	this.addTextToLastLine = function(text){//最終行にテキスト追加
		this.lines[this.lines.length-1].innerHTML += text;
	};
	this.getAtt = function(str, attlist){//属性値の取得関数
		temp = {};
		if (typeof(attlist) == 'string') attlist = attlist.split(',');
		for (var i=0; i<attlist.length; i++){
			r = new RegExp(attlist[i] + '=\"([^\"]*)\"', 'i');
			r2 = new RegExp(attlist[i] + '=([^\"\s>]+)', 'i');
			if (t = str.match(r)){
				temp[attlist[i]] = t[1];
			} else if (t = str.match(r2)){
				temp[attlist[i]] = t[1];
			} else {
				temp[attlist[i]] = '';
			}
		}
		return temp;
	};
	this.processBlockElement = function(elm){//ブロックエレメントを処理
		var tag = elm.tagName;
		switch (tag){
			case 'H1':
			case 'H2':
			case 'H3':
			case 'P':
				this.processInlineElement(elm.innerHTML, Math.floor((brTheme.page.width - brTheme.page.paddingLeft) / brTheme.blockElements[tag].letterWidth), tag);
				break;
			case 'HR':
				this.addLine('HR');
				break;
			case 'IMG':
				img = this.addLine('IMG');
				img.src = elm.src;
				img.alt = elm.alt;
				bw = this.getBoxWidht();
				w = elm.width;
				if (!w || w > bw){
					img.width = bw;
				} else {
					img.width = w;
				}
				break;
		};
	};
	this.processInlineElement = function(str, maxletter, parentTag) {//指定文字数ごとに(禁則処理あり)、文字列を分割する
		str = escape(str);//文字種判別のためにエスケープ
		pos = 0, n = 0, len = 0, dif = 1, w = 1, tag = false, tagstr = '', tagpos = -1, entity = false, entstr = '', nobr = false;
		while (pos < str.length) {
			//Unicode文字 (例:%u0000): 6桁-全角
			if (str.charAt(pos) == "%" && str.charAt(pos+1) == "u") { dif = 6, w = 2; }
				//英数字以外 (例:%00): 3桁-半角
				else if (str.charAt(pos) == "%") { dif = 3, w = 1; }
					//英数字 (例:A): 1桁-半角
					else { dif = 1, w = 1.1; }
			c = unescape(str.substr(pos, dif)); //調査する文字
			if (c == '<'){ tag = true; tagpos = pos; }//タグ開始
			if (!tag && c == '&'){ entity = true; }//実体参照開始
			if (tag){ tagstr += c; pos += dif; len += 0; }//タグの内部
			else if (entity){ entstr += c; pos += dif; len += 0; }//実体参照の内部
			else {
				if (len == 0 && pos > 0　&& this.kinsokuModoshi.indexOf(c) > -1){//2行目以降の行頭で、禁則処理(前行への戻し)
					this.addTextToLastLine(c); pos += dif; len = 0; n = pos;
				} else {
					if (len == 0){ this.addLine(parentTag,c); }　else { this.addTextToLastLine(c);　}
					pos += dif; len += w; nobr = false;
				}
			}
			if (c == '>' && tagstr != ''){//タグの処理
				tagname = tagstr.match(/\w+/i).toString().toUpperCase();//タグの名称 (大文字で)
				closing = (null != tagstr.match(/\/\w+/i));//閉じタグかどうか
				o = '';
				switch (tagname){
					case 'SPAN':
					case 'STRONG':
					case 'STRIKE':
					case 'EM':
					case 'I':
					case 'B':
					case 'DEL':
						o = tagstr; break;
					case 'A':
						if (closing){
							o = tagstr;
						} else {
							att = this.getAtt(tagstr, 'name,href,target');
							if (att.name) BookReader.ancStack.push(att.name);
							o = '<a';
							if (att.href){
								o += ' href="'+att.href+'"';
								if (att.target) o += ' target="'+att.target+'"';
								if ((!att.target || att.target == '_self') && (null != att.href.match(/^#/i)))
									o += ' onclick="BookReader.go2anchor(\''+att.href+'\');"';
							}
							o += '>';
						}
						break;
					case 'BR':
						if (nobr){nobr = false} else {o = tagstr}; break;
					case 'HR':
						this.addLine('HR'); len = 0; break;
					case 'IMG':
						letterwidth = brTheme.LineWidth / brTheme[BookReader.FontSize].MaxLetter;
						att = this.getAtt(tagstr, 'src,width,alt,class');
						if (!att.width) att.width = letterwidth*2.0;
						if (att['class'] != 'illustration'){
							o = '<img src="'+att.src+'" style="" width="'+att.width+'" alt="'+att.alt+'">';
							len += att.width/letterwidth;
						}
						break;
				}
				if (o){ if (len == 0){ this.addLine(parentTag, o); } else { this.addTextToLastLine(o);　} len += 0.1; }//TODO: +0.1はアドホックなので直すこと
				if (tagname == 'BR'){ len = 0; n = pos; }
				tag = false; tagstr = ''; tagpos = -1;
			}
			if (entity && c == ';'){//実体参照の処理
				if (len == 0){ this.addLine(parentTag, entstr); } else { this.addTextToLastLine(entstr);　}
				len += 1; entity = false; entstr = '';
			}
			if (len >= maxletter || pos == str.length){//行末に達したら...
				if (this.kinsokuOkuri.indexOf(c) > -1){//禁則処理(後行への送り)
					str = this.lines[this.lines.length-1].innerHTML;
					this.lines[this.lines.length-1].innerHTML = str.substr(0,str.length-1);
					n = pos-dif; len = w; this.addLine(parentTag, c);
				}
				else { n = pos; len = 0; }
				nobr = true;
			}
		}
	};
		
	this.initialize();//コンストラクタ呼び出し
}

//var brRendererCSS3 = function(){//CSS3用
//	this.initialize = function(){
//		//public
//		this.pageLength = 0;
//	};
//	this.makeHTML = function(src){
//		var html = '<DIV id="br_container" style="width:1440px; height:460px; padding:20px 30px; -moz-column-count:auto; -moz-column-width:440px; -moz-column-gap:60px;">'+src.innerHTML+'</DIV>';
//		this.pageLength = 10;
//		return html;
//	};
//	this.resize = function(){
//	};
//	
//	this.initialize();//コンストラクタ呼び出し
//};
//var brRendererPseudoCSS3 = function(){//css3-muliti-column.js用 ()
//	this.initialize = function(){
//		//public
//		this.pageLength = 0;
//	};
//	this.makeHTML = function(src){
//	};
//	this.resize = function(){
//	};
//	
//	this.initialize();//コンストラクタ呼び出し
//};

/* BookReader用エフェクト */
var brEffect = function(){//横スクロール (デフォルトのエフェクト)
	this.initialize = function(){
		this.interval = 25;
		this.msMax = 500;
		this.msStart = 0;
		this.start = 0;
		this.end = 0;
		this.timer = 0;
		this.counter = 0;
		this.bounding = false;
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
	};
	this.go2 = function(pos){//通常のページ移動のエフェクト
		var d = new Date();
		this.interval = 25;
		this.msMax = 500;
		this.msStart = d.getTime();
		this.start = document.body.parentNode.scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft;
		this.end = pos+30;
		this.onEndEffect = function(){};
		this.bounding = false;
		if (this.counter == 0) this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		this.counter++;
	};
	this.go2end = function(pos){//終端ページで跳ね返るエフェクト
		var d = new Date();
		if (this.bounding) return;
		this.interval = 25;
		this.msMax = 250;
		this.msStart = d.getTime();
		this.start = document.body.parentNode.scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft;
		this.end = (pos==0) ? 0 : pos + 30*2;
		this.onEndEffect = function(){
			var d = new Date();
			this.msStart = d.getTime();
			this.start = this.end;
			this.end = (this.end==0) ? 30 : this.end-30;
			this.onEndEffect = function(){ this.bounding = false };
			this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		};
		this.bounding = true;
		if (this.counter == 0) this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		this.counter++;
	};
	this.onEndEffect = function(){};
	this.effect = function(){
		var d = new Date();
		var ms = d.getTime() - this.msStart;
		var MSm = this.msMax;
		if (ms > MSm) ms = MSm;
		var L = this.end - this.start;
		var x = (this.counter <= 1) ? (1-Math.cos(Math.PI*ms/MSm))*0.5*L : Math.sin(Math.PI*ms*0.5/MSm)*L;
		scrollTo(this.start+x, 0);
		if (ms == MSm) {
			clearInterval(this.timer);
			this.timer = 0;
			this.counter = 0;
			this.onEndEffect();
		}
	};
	this.scroll = function(){
		if (this.timer) return false;
		var pos = document.body.parentNode.scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft;
		var cp = Math.round((pos-30)/(brTheme.page.width+1));
		pos = cp * (brTheme.page.width+1) + 30;
		BookReader.cp = cp;
		scrollTo(pos,0);
		return true;
	};
	
	this.initialize();//コンストラクタ呼び出し
};
var brEffectQuick = function(){//クイック
	this.initialize = function(){
		this.end = 0;
		this.timer = 0;
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
	};
	this.go2 = function(pos){//通常のページ移動のエフェクト
		this.end = pos+30;
		this.timer = setInterval("brObjects["+this.idx+"].effect();",20);
	};
	this.go2end = function(pos){//終端ページで跳ね返るエフェクト
		this.go2(pos);
	};
	this.effect = function(){
		scrollTo(this.end,0);
		clearInterval(this.timer);
		this.timer = 0;
	};
	this.scroll = function(){
		if (this.timer) return false;
		var pos = document.body.parentNode.scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft;
		var cp = Math.round((pos-30)/(brTheme.page.width+1));
		pos = cp * (brTheme.page.width+1) + 30;
		BookReader.cp = cp;
		scrollTo(pos,0);
		return true;
	};
	
	this.initialize();//コンストラクタ呼び出し
};
var brEffectFade = function(){//フェード
	this.initialize = function(){
		this.interval = 25;
		this.msMax = 500;
		this.msStart = 0;
		this.start = 0;
		this.end = 0;
		this.timer = 0;
		this.counter = 0;
		this.stage = 0;
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
	};
	this.go2 = function(pos){//通常のページ移動のエフェクト
		var d = new Date();
		this.interval = 25;
		this.msMax = 500;
		this.msStart = d.getTime();
		this.start = document.body.parentNode.scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft;
		this.end = pos+30;
		this.stage = 0;
		this.onEndEffect = function(){
			scrollTo(this.end,0);
			var d = new Date();
			this.msStart = d.getTime();
			this.onEndEffect = function(){};
			this.stage = 1;
			this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		};
		this.bounding = true;
		if (this.counter == 0) this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		this.counter++;
		this.end = pos+30;
		this.timer = setInterval("brObjects["+this.idx+"].effect();",20);
	};
	this.go2end = function(pos){//終端ページで跳ね返るエフェクト
		this.go2(pos);
	};
	this.onEndEffect = function(){};
	this.effect = function(){
		var d = new Date();
		var ms = d.getTime() - this.msStart;
		var MSm = this.msMax;
		if (ms > MSm) ms = MSm;
		var x = (this.stage == 0) ? Math.cos(Math.PI*0.5*ms/MSm) : Math.sin(Math.PI*0.5*ms/MSm);
		x = Math.round(x*100)*0.01;
		this.setAlpha(x);
		if (ms == MSm) {
			clearInterval(this.timer);
			this.timer = 0;
			this.counter = 0;
			this.onEndEffect();
		}
	};
	this.setAlpha = function(alpha){
		if (isIE) BookReader.divBody.style.filter = "alpha(opacity="+Math.round(alpha*100)+")";
			else BookReader.divBody.style.opacity = alpha;
	};
	this.scroll = function(){
		if (this.timer) return false;
		var pos = document.body.parentNode.scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft;
		var cp = Math.round((pos-30)/(brTheme.page.width+1));
		pos = cp * (brTheme.page.width+1) + 30;
		BookReader.cp = cp;
		scrollTo(pos,0);
		return true;
	};
	
	this.initialize();//コンストラクタ呼び出し
};
var brEffectDSlide = function(){//MacOSX Dashboard用スライドエフェクト
	this.initialize = function(){};
	this.go2 = function(el, pos){//通常のページ移動のエフェクト
		
	};
	this.go2end = function(el, pos){//終端ページで跳ね返るエフェクト
		
	};
	
	this.initialize();//コンストラクタ呼び出し
};
/* 汎用エフェクト */
var brAlphaEffect = function(el){// 透明効果
	this.initialize = function(el){
		this.element = el;
		this.interval = 25;
		this.msMax = 500;
		this.msStart = 0;
		this.start = 0;
		this.end = 0;
		this.timer = 0;
		
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
	};
	
	this.blink = function(){
		var d = new Date();
		this.msMax = 8000;
		this.msStart = d.getTime();
		this.start = 0.0;
		this.end = 0.9;
		this.phase =  6;
		eval("this.onEndEffect = function(){ brObjects["+this.idx+"].changeAlpha(0.4, 800); };");
		if (this.timer) clearInterval(this.timer);
		this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		this.counter++;
	};
	this.fadeIn = function(){
		this.changeAlpha(0.4, 1000);
	};
	this.changeAlpha = function(alpha, duration){
		var d = new Date();
		this.msMax = duration;
		this.msStart = d.getTime();
		this.start = this.getAlpha();
		this.end = alpha;
		this.phase = 1;
		this.onEndEffect = function(){};
		if (this.timer) clearInterval(this.timer);
		this.timer = setInterval("brObjects["+this.idx+"].effect();",this.interval);
		this.counter++;
	};
	this.setAlpha = function(alpha){
		if (isIE) this.element.style.filter = "alpha(opacity="+Math.round(alpha*100)+")";
			else this.element.style.opacity = alpha;
	};
	this.getAlpha = function(alpha){
		if (isIE){
			if (value = this.element.style.filter.match(/alpha\(opacity=(.*)\)/))
				if (value[1])
					return parseFloat(value[1]) / 100;
      return 1.0;
		} else {
			return this.element.style.opacity ? parseFloat(this.element.style.opacity) : 0.0;
		}
	};
	this.onEndEffect = function(){};
	this.effect = function(){
		var d = new Date();
		var ms = d.getTime() - this.msStart;
		var MSm = this.msMax;
		if (ms > MSm) ms = MSm;
		var n = this.phase;
		var L = this.end - this.start;
		var x = (1-Math.cos(Math.PI*ms*n/MSm))*0.5*L;
		this.setAlpha(this.start+Math.round(x*100)*0.01);
		if (ms == MSm) {
			clearInterval(this.timer);
			this.timer = 0;
			this.counter = 0;
			this.onEndEffect();
		}
	};
	
	this.initialize(el);
}


/* ボタン */
var brButton = function(id, title, click, nofade){
	this.initialize = function(id, title, click, nofade){
		this.element = document.createElement('A');
		this.nofade = (nofade) ? nofade : false;
		if (!this.nofade)
			this.alphaEffect = new brAlphaEffect(this.element);
		this.click = click;
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
		
		this.element.id = id;
		//this.element.href = '#';
		this.element.title = title;
		this.element.innerHTML = '&nbsp;';
		eval("this.element.onmouseover = function(){ brObjects["+this.idx+"].mouseover(); };");
		eval("this.element.onmouseout = function(){ brObjects["+this.idx+"].mouseout(); };");
		eval("this.element.onclick = function(){ brObjects["+this.idx+"].click(); return false };");
	};
	this.mouseover = function(){ if (!this.nofade) this.alphaEffect.changeAlpha(0.9, 200); };
	this.mouseout = function(){ if (!this.nofade) this.alphaEffect.changeAlpha(0.4, 400); };
	this.blink = function(){ if (!this.nofade) this.alphaEffect.blink(); };
	this.fadeIn = function(){ if (!this.nofade) this.alphaEffect.changeAlpha(0.4, 1000); };
	
	this.initialize(id, title, click, nofade);//コンストラクタ呼び出し
};

/* ナビゲーション */
var brNavigation = function(){
	this.initialize = function(){
		this.element = document.createElement('DIV');
		this.prev = new brButton('br_nav_prev', brLanguage.ButtonTitleGoToPrev, function(){ BookReader.go2prev(); });
		this.next = new brButton('br_nav_next', brLanguage.ButtonTitleGoToNext, function(){ BookReader.go2next(); });
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
		
		this.element.appendChild(this.prev.element);
		this.element.appendChild(this.next.element);
	};
	
	this.initialize();//コンストラクタ呼び出し
};

/* ツールバー */
var brToolbar = function(){
	this.initialize = function(){
		this.element = document.createElement('DIV');
		this.alphaEffect = new brAlphaEffect(this.element);
		this.buttons = {
			home: new brButton('br_toolbar_home', '', function(){ BookReader.go2first(); }, true),
			prev: new brButton('br_toolbar_prev', '', function(){ BookReader.go2prev(); }, true),
			next: new brButton('br_toolbar_next', '', function(){ BookReader.go2next(); }, true),
			end: new brButton('br_toolbar_end', '', function(){ BookReader.go2last(); }, true),
			print: new brButton('br_toolbar_print', '', function(){ print(); }, true),
			sidebar: new brButton('br_toolbar_sidebar', '', function(){ BookReader.sidebar.toggle(); }, true),
			escape: new brButton('br_toolbar_escape', '', function(){ BookReader.escape(); }, true)
		};
		this.divTooltip1 = document.createElement('DIV');
		this.divTooltip2 = document.createElement('DIV');
		this.divPager = document.createElement('DIV');
		this.divPagerBalloon = document.createElement('DIV');
		this.tablePager = null;
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
		
		var div1 = document.createElement('DIV');
		div1.id = 'br_toolbar_group1';
		this.divTooltip1.id = 'br_toolbar_tooltip1';
		this.divTooltip1.innerHTML = brLanguage.ButtonTitleGroup1;
		div1.appendChild(this.buttons.home.element);
		div1.appendChild(this.buttons.prev.element);
		div1.appendChild(this.buttons.next.element);
		div1.appendChild(this.buttons.end.element);
		div1.appendChild(this.divTooltip1);
		
		var div2 = document.createElement('DIV');
		div2.id = 'br_toolbar_group2';
		this.divTooltip2.id = 'br_toolbar_tooltip2';
		this.divTooltip2.innerHTML = brLanguage.ButtonTitleGroup2;
		div2.appendChild(this.buttons.print.element);
		div2.appendChild(this.buttons.sidebar.element);
		div2.appendChild(this.buttons.escape.element);
		div2.appendChild(this.divTooltip2);
		
		this.divPager.id = 'br_toolbar_pager';
		this.divPagerBalloon.id = 'br_toolbar_pagerballoon';
		var divCopyright = document.createElement('DIV');
		divCopyright.id = 'br_toolbar_copyright';
		divCopyright.innerHTML = brConf.copyright;//著作権
		this.divPager.appendChild(divCopyright);
		this.divPager.appendChild(this.divPagerBalloon);
		
		this.element.appendChild(div1);
		this.element.appendChild(div2);
		this.element.appendChild(this.divPager);
		
		eval("this.element.onmouseover = function(){ brObjects["+this.idx+"].mouseover(); };");
		eval("this.element.onmouseout = function(){ brObjects["+this.idx+"].mouseout(); };");
		eval("this.buttons.home.mouseover = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGoToHome; };");
		eval("this.buttons.home.mouseout = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGroup1; };");
		eval("this.buttons.prev.mouseover = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGoToPrev; };");
		eval("this.buttons.prev.mouseout = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGroup1; };");
		eval("this.buttons.next.mouseover = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGoToNext; };");
		eval("this.buttons.next.mouseout = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGroup1; };");
		eval("this.buttons.end.mouseover = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGoToEnd; };");
		eval("this.buttons.end.mouseout = function(){ brObjects["+this.idx+"].divTooltip1.innerHTML = brLanguage.ButtonTitleGroup1; };");
		eval("this.buttons.print.mouseover = function(){ brObjects["+this.idx+"].divTooltip2.innerHTML = brLanguage.ButtonTitlePrint; };");
		eval("this.buttons.print.mouseout = function(){ brObjects["+this.idx+"].divTooltip2.innerHTML = brLanguage.ButtonTitleGroup2; };");
		eval("this.buttons.sidebar.mouseover = function(){ brObjects["+this.idx+"].divTooltip2.innerHTML = brLanguage.ButtonTitleSidebar; };");
		eval("this.buttons.sidebar.mouseout = function(){ brObjects["+this.idx+"].divTooltip2.innerHTML = brLanguage.ButtonTitleGroup2; };");
		eval("this.buttons.escape.mouseover = function(){ brObjects["+this.idx+"].divTooltip2.innerHTML = brLanguage.ButtonTitleEscape; };");
		eval("this.buttons.escape.mouseout = function(){ brObjects["+this.idx+"].divTooltip2.innerHTML = brLanguage.ButtonTitleGroup2; };");
	};
	this.updatePagerBalloon = function(){
		var p = BookReader.cp+1;
		var max = BookReader.renderer.pages.length;
		var left = Math.floor(this.tablePager.offsetLeft + this.element.offsetLeft + (this.tablePager.offsetWidth/max*(p-0.5)) - this.divPagerBalloon.offsetWidth/2);
		this.divPagerBalloon.innerHTML = p;
		this.divPagerBalloon.style.left = left+'px';
	};
	this.updatePager = function(pageCount){
		var td, tr, tbody, table;
		if (this.tablePager)
			this.divPager.removeChild(this.tablePager);
		table = document.createElement('TABLE');
		tbody = document.createElement('TBODY');
		tr = document.createElement('TR');
		for (var i=0; i<pageCount; i++){
			td = document.createElement('TD');
			td.innerHTML = '&nbsp;';
			td.className = (i%2==0) ? 'odd' : 'even';
			td.onmouseover = function(){ this.style.backgroundColor = '#BEE0FD'; };
			td.onmouseout = function(){ this.style.backgroundColor = ''; };
			eval("td.onclick = function(){ BookReader.go2page("+i+"); }");
			tr.appendChild(td);
		};
		tbody.appendChild(tr);
		table.appendChild(tbody);
		this.divPager.appendChild(table);
		this.tablePager = table;
		this.updatePagerBalloon();
	};
	this.mouseover = function(){ this.alphaEffect.changeAlpha(0.95, 200); };
	this.mouseout = function(){ this.alphaEffect.changeAlpha(0.0, 400); };
	this.fadeIn = function(){ this.alphaEffect.changeAlpha(0.4, 1000); };
	this.fadeOut = function(){ this.alphaEffect.changeAlpha(0.0, 6000); };
	this.appear = function(){ this.alphaEffect.setAlpha(0.95); };
	
	this.initialize();//コンストラクタ呼び出し
};

/* サイドバー */
var brSidebar = function(src){
	this.initialize = function(src){
		this.element = document.createElement('DIV');
		this.alphaEffect = new brAlphaEffect(this.element);
		this.closeButton = new brButton('br_sidebar_close', brLanguage.ButtonTitleCloseSidebar, function(){ BookReader.sidebar.close(); }, true);
		this.closed = false;
		this.idx = brObjects.length;//配列の要素番号
		brObjects.push(this);//グローバル配列に登録
		
		if (src.parentNode){
			src.parentNode.removeChild(src);
			this.element.appendChild(src);
		}
		this.element.appendChild(this.closeButton.element);
		eval("this.element.onmouseover = function(){ brObjects["+this.idx+"].mouseover(); };");
		eval("this.element.onmouseout = function(){ brObjects["+this.idx+"].mouseout(); };");
	};
	this.toggle = function(){ if (this.closed) this.open(); else this.close(); };
	this.close = function(){ this.closed = true; this.alphaEffect.changeAlpha(0.0, 400); };
	this.open = function(){ this.closed = false; this.alphaEffect.changeAlpha(0.85, 200); };
	this.appear = function(){ this.closed = false; this.alphaEffect.setAlpha(0.85); };
	
	this.mouseover = function(){ if (!this.closed) this.alphaEffect.changeAlpha(1, 200); };
	this.mouseout = function(){ if (!this.closed) this.alphaEffect.changeAlpha(0.85, 200); };
	
	this.initialize(src);//コンストラクタ呼び出し
};


/** Global Functions **/

function brLoadScript(path){ document.write('<sc'+'ript type="text/javascript" src="'+path+'"></script>'); };
function brLoadStyle(path, media){ document.write('<link rel="stylesheet" type="text/css" href="'+path+'" media="'+media+'" />'); };
function brWindowWidth(){ return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; };
function brWindowHeight(){ return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; };
function brSetCookie(key, val) { document.cookie = key+"="+escape(val)+"; expires=Tue, 31-Dec-2030 23:59:59; path=/"; };
function brGetCookie(key) {
	var tmp1, tmp2, xx1, xx2, xx3;	
	tmp1 = " " + document.cookie + ";";
	xx1 = xx2 = 0;
	len = tmp1.length;
	while (xx1 < len) {
		xx2 = tmp1.indexOf(";", xx1);
		tmp2 = tmp1.substring(xx1 + 1, xx2);
		xx3 = tmp2.indexOf("=");
		if (tmp2.substring(0, xx3) == key) {
			return(unescape(tmp2.substring(xx3 + 1, xx2 - xx1 - 1)));
		}
		xx1 = xx2 + 1;
	}
	return("");
};
function brStrTrim(str){ return str.replace(/^¥s+|¥s+$/g, ""); };

/** Globals **/

var brConf = {};
if (typeof isIE=='undefined') var isIE = (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent));

/** Setups **/

function setupBookReader(){
	var script, copyright='', author='';
	var scripts = document.getElementsByTagName("script");
	var metas = document.getElementsByTagName("meta");
	for (var i=0; i<scripts.length; i++)
		if (scripts[i].src && scripts[i].src.match(/bookreader(\.src)?\.js(\?.*)?$/))
			script = scripts[i];
	for (var i=0; i<metas.length; i++){
		if (metas[i].name && metas[i].name.toUpperCase() == 'COPYRIGHT')
			copyright = metas[i].content;
		else if (metas[i].name && metas[i].name.toUpperCase() == 'AUTHOR')
			author = metas[i].content;
	}
	brConf.path = script.src.replace(/bookreader(\.src)?\.js(\?.*)?$/,'');
	brConf.viewermode = (tmp = script.src.match(/\?.*viewermode=yes/)) ? true : false;
	brConf.toolbar = (tmp = script.src.match(/\?.*toolbar=yes/)) ? true : false;
	brConf.renderer = (tmp = script.src.match(/\?.*renderer=(css3|pcss3)/)) ? tmp[1] : 'default';
	brConf.effect = (tmp = script.src.match(/\?.*effect=(fade|quick)/)) ? tmp[1] : 'default';
	brConf.theme = (tmp = script.src.match(/\?.*theme=([a-z0-9]*)/)) ? tmp[1] : 'default';
	brConf.language = (tmp = script.src.match(/\?.*language=([a-z0-9_]*)/)) ? tmp[1] : 'ja';
	brConf.os = 'default';//(navigator.userAgent.indexOf('Mac OS X') > -1) ? 'mac' : ((navigator.userAgent.indexOf('Windows NT 6') > -1) ? 'vista' : 'default');
	brConf.copyright = (copyright != '') ? copyright : ((author != '') ? 'Copyright &copy; ' + author + ' All rights reserved.' : '<strong>bookreader.js</strong> / powered by CogniTom ');
	
	brLoadScript(brConf.path+'languages/'+brConf.language+'.js');//言語ファイルの読み込み
	brLoadScript(brConf.path+'themes/'+brConf.theme+'/settings.js');//環境別のパラメタ
	if (brConf.viewermode){
		brLoadStyle(brConf.path+'common.css', 'screen');//共通のスタイル
		brLoadStyle(brConf.path+'themes/'+brConf.theme+'/screen.css', 'screen');//テーマのスタイル
		brLoadStyle(brConf.path+'themes/'+brConf.theme+'/print.css', 'print');//印刷用のスタイル
	}
	
	if (window.attachEvent) window.attachEvent('onload', setupBookReaderOnLoad);//IE
		else if (window.addEventListener) window.addEventListener('load', setupBookReaderOnLoad, true);//W3C
			else window.onload = setupBookReaderOnLoad;
}
function setupBookReaderOnLoad(){
	if (brConf.viewermode){
		switch (brConf.renderer){//マルチカラムレンダリング方式の選択
			//case 'css3': var rd = new brRendererCSS3(); break;//css3
			//case 'pcss3': var rd = new brRendererPseudoCSS3(); break;//css3-multi-column.js
			default: var rd = new brRenderer(); break;//bookreader
		};
		switch (brConf.effect){//ページ遷移エフェクトの選択
			case 'quick': var ef = new brEffectQuick(); break;//出現 (エフェクトなし)
			case 'fade': var ef = new brEffectFade(); break;//フェード
			default: var ef = new brEffect(); break;//横スクロール
		};
		var book = new brBook(rd, ef);
		//if (anc = location.hash) book.go2anchor(anc);
		
		//イベント登録
		var eKeydown = function(e){ BookReader.keydown(e); };//キーボードショートカット
		var eKeyup = function(e){ BookReader.keyup(e); };//キーボードショートカット
		var eResize = function(e){ BookReader.resize(e); };//画面リサイズ
		var eScroll = function(e){ BookReader.scroll(e); };//
		if (document.attachEvent){//IE
			document.attachEvent('onkeydown', eKeydown);
			document.attachEvent('onkeyup', eKeyup);
			window.attachEvent('onresize', eResize);
		} else if (document.addEventListener){//W3C
			document.addEventListener('keydown', eKeydown, true);
			document.addEventListener('keyup', eKeyup, true);
			window.addEventListener('resize', eResize, true);
			document.addEventListener('scroll', eScroll, true);
		} else {
			document.onkeydown = eKeydown;
			document.onkeyup = eKeyup;
			window.onresize = eResize;
		}
	}
}
setupBookReader();