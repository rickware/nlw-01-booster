'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
var ifaces = os_1.networkInterfaces();
var serverIP = '';
Object.keys(ifaces).forEach(function (ifname) {
    var _a;
    var alias = 0;
    (_a = ifaces[ifname]) === null || _a === void 0 ? void 0 : _a.forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }
        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
            serverIP = iface.address;
        }
        else {
            // this interface has only one ipv4 adress
            serverIP = iface.address;
        }
        ++alias;
    });
});
exports.default = serverIP;
//# sourceMappingURL=getServerIP.js.map