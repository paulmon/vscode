'use strict';
import fs = require('fs');

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var request = require('request');
var iotOutputChannel = vscode.window.createOutputChannel('IoT');

var appx = {
    "arm" : {
        "package": "NodeScriptHost_1.0.0.0_ARM.appx",
        "certificate": "NodeScriptHost_1.0.0.0_ARM.appx",
        "dependencies": [
            "Microsoft.VCLibs.ARM.14.00"
        ]
    },
    "x86" : {
        "package": "NodeScriptHost_1.0.0.0_x86.appx",
        "certificate": "NodeScriptHost_1.0.0.0_x86.appx",
        "dependencies": [
            "Microsoft.VCLibs.x86.14.00"
        ]
    },
    "x64" : {
        "package": "NodeScriptHost_1.0.0.0_x64.appx",
        "certificate": "NodeScriptHost_1.0.0.0_x64.appx",
        "dependencies": [
            "Microsoft.VCLibs.x64.14.00"
        ]
    }
};

export class IotDevice
{
    //private outputChannel : vscode.OutputChannel;
    
    constructor()
    {
        // todo: why aren't lambas inside class declarations in class scope?
        //this.outputChannel = vscode.window.createOutputChannel('IoT');
    }
    
    public GetHost() : Thenable<string>
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string = config.get('Device.IpAddress', '');
        if (host)
        {
            return new Promise<string> (function (resolve, reject){ 
                resolve(host);
            });
        }
        else
        {
            return vscode.window.showInputBox({"placeHolder":"device ip address", "prompt":"Enter IP Address"});
        }
    }

    public GetUserName() : Thenable<string>
    {
        var config = vscode.workspace.getConfiguration('iot');
        var userName :string = config.get('Device.UserName', '');
        if (userName)
        {
            return new Promise<string> (function (resolve, reject){ 
                resolve(userName);
            });
        }
        else
        {
            return vscode.window.showInputBox({"placeHolder":"user name", "prompt":"Enter Device User Name"});
        }
    }
    
    public GetPassword() : Thenable<string>
    {
        var config = vscode.workspace.getConfiguration('iot');
        var password :string = config.get('Device.Password', '');
        if (password)
        {
            return new Promise<string> (function (resolve, reject){ 
                resolve(password);
            });
        }
        else
        {
            return vscode.window.showInputBox({"placeHolder":"password", "prompt":"Enter Device Password"});
        }
    }

    private FileFromPath(path :string) :string
    {
        var filename = path.replace(/^.*[\\\/]/, '');
        return filename;
    }
    
    public GetExtensionInfo()
    {
        let ext = vscode.extensions.getExtension('Microsoft.windowsiot');
        iotOutputChannel.show();
        iotOutputChannel.appendLine('ext.extensionPath=' + ext.extensionPath);
        iotOutputChannel.appendLine('ext.exports=' + ext.exports);
        iotOutputChannel.appendLine('ext.id=' + ext.id);
        iotOutputChannel.appendLine('version='+ext.packageJSON.version);
        iotOutputChannel.appendLine('');
    }
    
    public ListIotCommands()
    {
        let ext = vscode.extensions.getExtension('Microsoft.windowsiot');
        iotOutputChannel.show();
        var commands = ext.packageJSON.contributes.commands;
        iotOutputChannel.appendLine('List IoT Extension Commands:')
        commands.forEach(c => {
            iotOutputChannel.appendLine(c.title)
        })
        iotOutputChannel.appendLine('');
    }
    
    public GetDeviceInfo(host: string, userName: string, password: string) : Thenable<any>
    {
        return new Promise<any>( (resolve, reject) =>
        {
            //var config = vscode.workspace.getConfiguration('iot');               
            var url = 'http://' + host + ':8080/api/os/info';
            console.log ('url=' + url)

            var param = {'auth': {
                'user': userName,
                'pass': password
            }};

            var req = request.get(url, param, function (err, resp, body) {
                if (!err && resp.statusCode == 200) 
                {
                    var info = JSON.parse(body);
                    resolve(info);
                }
                else
                { 
                    if (err)
                    {
                        console.log(err.message);
                        iotOutputChannel.appendLine(err.message);
                        iotOutputChannel.appendLine( '' );
                    }

                    if (resp.statusCode != 200)
                    {
                        var info = JSON.parse(body);
                        iotOutputChannel.appendLine(info.Reason + ' status=' + resp.statusCode);
                        iotOutputChannel.appendLine( '' );
                    }
                } 
            });
        });
    }
    
    public PrintDeviceInfo(host: string, info: any)
    {
        iotOutputChannel.show();
        iotOutputChannel.appendLine('Get Device Info:');
        iotOutputChannel.appendLine( 'Device=' + host );
        iotOutputChannel.appendLine( 'ComputerName=' + info.ComputerName );
        iotOutputChannel.appendLine( 'Language=' + info.Language );
        iotOutputChannel.appendLine( 'OsEdition=' + info.OsEdition );
        iotOutputChannel.appendLine( 'OsEditionId=' + info.OsEditionId );
        iotOutputChannel.appendLine( 'OsVersion=' + info.OsVersion );
        iotOutputChannel.appendLine( 'Platform=' + info.Platform );
        iotOutputChannel.appendLine( '' );
    }

    public GetDeviceName()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        this.GetHost().then((h:string) => {
            host = h; 
            
            var url = 'http://' + host + ':8080/api/os/machinename';
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            iotOutputChannel.appendLine('Get Device Name:');
            var req = request.get(url, param, function (err, resp, body) {
                if (!err && resp.statusCode == 200) 
                {
                    var info = JSON.parse(body);
                    iotOutputChannel.appendLine( 'Device=' + host );
                    iotOutputChannel.appendLine( 'ComputerName=' + info.ComputerName);
                    iotOutputChannel.appendLine( '' );
                }                    
                else 
                {
                    if (err){
                        console.log(err.message);
                        iotOutputChannel.appendLine(err.message);
                        iotOutputChannel.appendLine( '' );
                    }

                    if (resp.statusCode != 200)
                    {
                        var info = JSON.parse(body);
                        iotOutputChannel.appendLine(info.Reason + ' status=' + resp.statusCode);
                        iotOutputChannel.appendLine( '' );
                    }
                }
            });
        });                       
    }
    
    public SetDeviceName()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        this.GetHost().then((h:string) => {
            host = h; 
            
            var devicename = config.get('Device.DeviceName', '');
            if (!devicename)
            {
                console.log("iot.DeviceName is null");
                vscode.window.showErrorMessage('Please specify iot.DeviceName in workspace settings');
                return;
            }
            
            var url = 'http://' + host + ':8080/api/iot/device/name?newdevicename=' + new Buffer(devicename).toString('base64');
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            var req = request.post(url, param, function (err, resp, body) {
                if (!err && resp.statusCode == 200) 
                {
                    iotOutputChannel.appendLine(`Set Device Name succeeded!`);
                    iotOutputChannel.appendLine( '' );
                    
                    let iotDevice = new IotDevice();
                    iotDevice.RestartDevice(host);
                }
                else
                {
                    if (err){
                        iotOutputChannel.appendLine(err.message);
                        iotOutputChannel.appendLine( '' );
                    }

                    if (resp.statusCode != 200)
                    {
                        var info = JSON.parse(body);
                        iotOutputChannel.appendLine(info.Reason + ' status=' + resp.statusCode);
                        iotOutputChannel.appendLine( '' );
                    }
                }
            });
        });                       
    }
    
    public RestartDevice(host: string)
    {
        var config = vscode.workspace.getConfiguration('iot');
        
        var param = {'auth': {
            'user': config.get("Device.UserName"),
            'pass': config.get("Device.Password")
        }};

        iotOutputChannel.show();
        var restarturl = 'http://' + host + ':8080/api/control/restart';
        var restartreq = request.post(restarturl, param, function (err, resp, body) {
            if (!err && resp.statusCode == 200) 
            {
                iotOutputChannel.appendLine(`Restarting device...`)
                iotOutputChannel.appendLine( '' );
            }
            else 
            {   if (err)
                {
                    console.log(err.message);
                    iotOutputChannel.appendLine(err.message);
                    iotOutputChannel.appendLine( '' );
                }
            }
        });
    }
    
    public UploadFile()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        let iotDevice = new IotDevice();
        this.GetHost().then((h:string) => {
            host = h; 
            
            var iotfile :string = config.get('File', '');
            if (!iotfile)
            {
                console.log("iot.File is null");
                vscode.window.showErrorMessage('Please specify iot.File in workspace settings');
                return;
            }
            
            var packageFullName = config.get('AppxInfo.PackageFullName');

            var url = 'http://' + host + ':8080/api/filesystem/apps/file?knownfolderid=LocalAppData&packagefullname=' + packageFullName + '&path=\\LocalState';
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            iotOutputChannel.appendLine( `Uploading file ${iotfile} ...` );
            var req = request.post(url, param, function (err, resp, body) {
                if (err){
                    console.log(err.message);
                    iotOutputChannel.appendLine(err.message);
                    iotOutputChannel.appendLine( '' );
                } else {
                    iotOutputChannel.appendLine(`Successfully uploaded ${iotfile}`)
                    iotOutputChannel.appendLine( '' );
                }
            });
            var form = req.form();
            form.append('file', fs.createReadStream(iotfile));
        });
    }

    public GetPackages()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        this.GetHost().then((h:string) => {
            host = h; 
            
            var url = 'http://' + host + ':8080/api/appx/packagemanager/packages';
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            var req = request.get(url, param, function (err, resp, body) {
                if (err){
                    console.log(err.message);
                    iotOutputChannel.appendLine(err.message);
                } else {
                    var info = JSON.parse(body);
                    info.InstalledPackages.forEach(element => {
                        iotOutputChannel.appendLine( 'Name: ' + element.Name );
                        iotOutputChannel.appendLine( 'PackageFamilyName: ' + element.PackageFamilyName);
                        iotOutputChannel.appendLine( 'PackageFullName: ' + element.PackageFullName);
                        iotOutputChannel.appendLine( 'PackageOrigin: ' + element.PackageOrigin);
                        iotOutputChannel.appendLine( 'PackageRelativeId: ' + element.PackageRelativeId);
                        iotOutputChannel.appendLine( 'Publisher: ' + element.Publisher);
                        element.RegisteredUsers.forEach(user =>{
                           iotOutputChannel.appendLine( 'UserDisplayName: ' + user.UserDisplayName);
                           iotOutputChannel.appendLine( 'Name: ' + user.UserSID); 
                        });
                        iotOutputChannel.appendLine( 'Version: ' + element.Version.Build + '.' + element.Version.Major + '.' + element.Version.Minor);
                        iotOutputChannel.appendLine( '');
                    });
                }
            });
        });
    }
    
    public InstallPackage()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        let iotDevice = new IotDevice();
        this.GetHost().then((h:string) => {
            host = h; 
            
            var appxInfo :any = config.get('AppxInfo', '');
            if (!appxInfo)
            {
                console.log("iot.AppxInfo is null");
                vscode.window.showErrorMessage('Please specify iot.AppxInfo in workspace settings');
                return;
            }
            
            var appxPath = appxInfo.Appx;
            var appxFile = this.FileFromPath(appxInfo.Appx);
            var certPath = appxInfo.Certificate;
            var certFile = this.FileFromPath(appxInfo.Certificate);

            var url = 'http://' + host + ':8080/api/appx/packagemanager/package?package=' + appxFile;
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            var req = request.post(url, param, function (err, resp, body) {
                if (err){
                    console.log(err.message);
                    iotOutputChannel.appendLine(err.message);
                    iotOutputChannel.appendLine( '' );
                } else {
                    if (resp.statusCode == 200)
                    {
                        iotOutputChannel.appendLine(`Successfully installed ${appxFile}`);
                    }
                    else
                    {
                        var info = JSON.parse(body);
                        iotOutputChannel.appendLine(info.Reason + ' status=' + resp.statusCode);
                    }
                    iotOutputChannel.appendLine( '' );
                }
            });
            var form = req.form();
            
            form.append(appxFile, fs.createReadStream(appxPath));
            form.append(certFile, fs.createReadStream(certPath));
            var dependencies :any = appxInfo.Dependencies;
            dependencies.forEach(dependency => {
                var depFile = this.FileFromPath(dependency);
                form.append(depFile, fs.createReadStream(dependency));
            })
        });
    }

    public RunCommandFromSettings()
    {
        // TODO: show pick list of commands from config file
        this.RunCommand('icacls c:\\data\\Users\\DefaultAccount\\AppData\\Local\\Packages\\NodeScriptHost_dnsz84vs3g3zp\\LocalState\\server.js /grant *S-1-5-21-2702878673-795188819-444038987-503:F');
    }
    
    public RunCommand(command: string)
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        let iotDevice = new IotDevice();
        this.GetHost().then((h:string) => {
            host = h; 
            
            var url = 'http://' + host + ':8080/api/iot/processmanagement/runcommand?command=' + new Buffer(command).toString('base64') + '&runasdefaultaccount=false' ;
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            iotOutputChannel.appendLine(`Running ${command}`)
            var req = request.post(url, param, function (err, resp, body) {
                if (err){
                    console.log(err.message);
                    iotOutputChannel.appendLine(err.message);
                    iotOutputChannel.appendLine( '' );
                } else {
                    iotOutputChannel.appendLine('resp.statusCode=' + resp.statusCode);
                    iotOutputChannel.appendLine( '' );
                }
            });
        });
    }

    public RunRemoteScript()
    {
        var iotHost :string;
        var iotUser :string;
        var iotPassword: string;
        this.GetHost().then( (host:string)=>{
            iotHost = host;
            return this.GetUserName();
        }).then( (userName:string) => {
            iotUser = userName;
            return this.GetPassword();
        }).then( (password: string) => {
            iotPassword = password;
            return this.GetDeviceInfo(iotHost, iotUser, iotPassword);
        }).then ( (info) => {
            var appxDetail = null;
            if (
                (info.Platform.startsWith("Virtual Machine") ||
                (info.Platform.startsWith("Minnowboard"))
            {
                appxDetail = appx.x86;
            }
            else if (
                (info.Platform.startsWith("Raspberry Pi") ||
                (info.Platform.startsWith("SBC"))
            {
                appxDetail = appx.arm;
            }

            iotOutputChannel.show();
            iotOutputChannel.appendLine('Run Remote Script:');
            if (appxDetail != null)
            {
                iotOutputChannel.appendLine( 'package=' + appxDetail.package );
                iotOutputChannel.appendLine( 'certificate=' + appxDetail.package );
                iotOutputChannel.appendLine( 'dependencies=' );
                appxDetail.dependencies.forEach(dep => {
                    iotOutputChannel.appendLine( "  " + dep );
                });
                iotOutputChannel.appendLine( '' );
            }
            else
            {
                iotOutputChannel.appendLine('Platform not recognized');
            }
        });
    }

    public StartApp()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        let iotDevice = new IotDevice();
        this.GetHost().then((h:string) => {
            host = h; 
            
            var packageRelativeId :string = config.get('AppxInfo.PackageRelativeId', '');
            if (!packageRelativeId)
            {
                console.log("iot.AppxInfo.PackageRelativeId is null");
                vscode.window.showErrorMessage('Please specify iot.AppxInfo.PackageRelativeId in workspace settings');
                return;
            }

            var url = 'http://' + host + ':8080/api/taskmanager/app?appid=' + new Buffer(packageRelativeId).toString('base64');
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            iotOutputChannel.appendLine(`Starting ${packageRelativeId}`);
            var req = request.post(url, param, function (err, resp, body) {
                if (err){
                    console.log(err.message);
                    iotOutputChannel.appendLin
                    e(err.message);
                    iotOutputChannel.appendLine( '' );
                } else {
                    iotOutputChannel.appendLine('Application Started');
                    iotOutputChannel.appendLine( '' );
                }
            });
        });
    }
    
    public StopApp()
    {
        var config = vscode.workspace.getConfiguration('iot');
        var host :string;
        let iotDevice = new IotDevice();
        this.GetHost().then((h:string) => {
            host = h; 
            
            var packageFullName :string = config.get('AppxInfo.PackageFullName', '');
            if (!packageFullName)
            {
                console.log("iot.AppxInfo.PackageFullName is null");
                vscode.window.showErrorMessage('Please specify iot.AppxInfo.PackageFullName in workspace settings');
                return;
            }

            var url = 'http://' + host + ':8080/api/taskmanager/app?package=' + new Buffer(packageFullName).toString('base64');
            console.log ('url=' + url)

            var param = {'auth': {
                'user': config.get("Device.UserName"),
                'pass': config.get("Device.Password")
            }};

            iotOutputChannel.show();
            iotOutputChannel.appendLine(`Stopping ${packageFullName}`);
            var req = request.delete(url, param, function (err, resp, body) {
                if (err){
                    console.log(err.message);
                    iotOutputChannel.appendLine(err.message);
                    iotOutputChannel.appendLine( '' );
                } else {
                    iotOutputChannel.appendLine('Application Stopped');
                    iotOutputChannel.appendLine( '' );
                }
            });
        });
    }
}
