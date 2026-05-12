import argparse
import asyncio

import edge_tts


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    communicate = edge_tts.Communicate(args.text, args.voice)
    await communicate.save(args.output)


if __name__ == "__main__":
    asyncio.run(main())
