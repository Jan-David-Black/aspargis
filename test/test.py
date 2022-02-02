#!env/bin/python
import logging
import asyncio

from aiocoap import *

import argparse

def check_positive(value):
    ivalue = int(value)
    if ivalue <= 0:
        raise argparse.ArgumentTypeError("%s is an invalid positive int value" % value)
    return ivalue
    
parser = argparse.ArgumentParser(description='Contact COAP server')
parser.add_argument('address', metavar='A',
                    help='Server Address')
                    
parser.add_argument('sgroup', metavar='S',
                    help='SGroup ID')
              
parser.add_argument('-n', action='store_true')

parser.add_argument('-r', default=1, type=check_positive)
                    
args = parser.parse_args()

logging.basicConfig(level=logging.INFO)


payload = b'{"payload": [{"Date": "", "Values": {"temp1": 22.3750, "temp2": 18.2500, "temp3": 18.6875, "temp4": 18.8125, "v_bat": 3247}}], "signal": 15}'
if args.n:
	payload = b'41604255471800780cd11404001f000000000000000061f39071'
	print("Using new Messgae Protocoll")

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
    for i in range(args.r):
        asyncio.get_event_loop().run_until_complete(main())
