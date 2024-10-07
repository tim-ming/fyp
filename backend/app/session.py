from socket import AF_INET
from typing import Any, Optional

import aiohttp


SIZE_POOL_AIOHTTP = 100


class Singleton:
    client: Optional[aiohttp.ClientSession] = None

    @classmethod
    def get_client(cls) -> aiohttp.ClientSession:
        if cls.client is None:
            timeout = aiohttp.ClientTimeout(total=2)
            connector = aiohttp.TCPConnector(family=AF_INET, limit_per_host=SIZE_POOL_AIOHTTP)
            cls.client = aiohttp.ClientSession(timeout=timeout, connector=connector)

        return cls.client

    @classmethod
    async def close_client(cls) -> None:
        if cls.client:
            await cls.client.close()
            cls.client = None

    @classmethod
    async def post_url(cls, url: str) -> Any:
        client = cls.get_client()

        async with client.post(url) as response:
            return await response.json()

        raise ValueError("Error")


async def on_start_up() -> None:
    Singleton.get_client()

async def on_shutdown() -> None:
    await Singleton.close_client()