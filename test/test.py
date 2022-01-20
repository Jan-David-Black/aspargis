#!env/bin/python
import logging
import asyncio

from aiocoap import *

import argparse

parser = argparse.ArgumentParser(description='Contact COAP server')
parser.add_argument('address', metavar='A',
                    help='Server Address')
                    
parser.add_argument('sgroup', metavar='S',
                    help='SGroup ID')
                    
args = parser.parse_args()

logging.basicConfig(level=logging.INFO)
payload = b'{"payload": [{"Date": "", "Values": {"temp1": 22.3750, "temp2": 18.2500, "temp3": 18.6875, "temp4": 18.8125, "v_bat": 3247}}], "signal": 15}'
async def main():
    protocol = await Context.create_client_context()

    request = Message(code=GET, uri='coap://'+args.address+':5683/mqtt/'+args.sgroup+'/', payload=payload)

    try:
        response = await protocol.request(request).response
    except Exception as e:
        print('Failed to fetch resource:')
        print(e)
    else:
        print('Result: %s\n%r'%(response.code, response.payload))

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
