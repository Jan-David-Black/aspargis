import logging
import asyncio

from aiocoap import *

logging.basicConfig(level=logging.INFO)
payload = b'{"payload": [{"Date": "", "Values": {"temp1": 19.3750, "temp2": 19.2500, "temp3": 19.6875, "temp4": 19.8125, "v_bat": 3247}}], "signal": 15}'
async def main():
    protocol = await Context.create_client_context()

    request = Message(code=GET, uri='coap://localhost/mqtt/10/', payload=payload)

    try:
        response = await protocol.request(request).response
    except Exception as e:
        print('Failed to fetch resource:')
        print(e)
    else:
        print('Result: %s\n%r'%(response.code, response.payload))

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())