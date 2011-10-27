bookreader.js
=================

bookreader.jsは、長文を縦スクロールではなく、横スクロールで表示し読みやすくするJavaScriptライブラリです。


使い方
-----

次のように、ヘッダでスクリプトを読込みます。

	<script type="text/javascript" src="js/bookreader/bookreader.src.js?theme=default&viewermode=yes&effect=default"></script>

* theme : 表示テーマ
* viewermode : yesで全画面表示
* effect : defaultでスライド表示

bookreader.jsで表示したい部分を

	<div id="bookreader">...</div>
	
で囲います。


開発状況
-----

2年半ほどほったらかしなので、CoffeeScriptで書き直そうかしら...、とか思ったりしています。
