module.exports = {
    vietnam: {
        servers: [{
                id:0,
                url: 'http://27.118.16.46:1586/VPGService.asmx?wsdl',
                partner_code: 'mrh5',
                partner_key: 'e12bad3bf55e7ed96bcfdbd1796f91cf',
                service_code: 'cardtelco',
                percent: 30,
                recharge:0
            },
            {
                id:1,
                url: 'http://27.118.16.46:1581/VPGService.asmx?wsdl',
                partner_code: 'xbom1',
                partner_key: '8a7e933170658b3e369fb61d104d5303',
                service_code: 'cardtelco',
                percent: 40,
                recharge:0
            }, {
                id:2,
                url: 'http://27.118.16.46:1581/VPGService.asmx?wsdl',
                partner_code: 'xbom1',
                partner_key: '8a7e933170658b3e369fb61d104d5303',
                service_code: 'cardtelco',
                percent: 30,
                recharge:0
            }, {
                id:3,
                url: 'http://27.118.16.46:1581/VPGService.asmx?wsdl',
                partner_code: 'xbom1',
                partner_key: '8a7e933170658b3e369fb61d104d5303',
                service_code: 'cardtelco',
                percent: 0,
                recharge:0
            }
        ],
        command: {
            useCard: 'usecard',
            buyCard: 'buycard'
        },
        payBalance:10000,
    }
}