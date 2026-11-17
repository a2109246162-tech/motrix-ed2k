# ED2K Engine

This directory contains the runtime pieces that turn Motrix into an eD2k client. Motrix itself does not implement eD2k; the protocol work is done by [aria2-next](https://github.com/AnInsomniacy/aria2-next).

## Files

| File | Purpose |
| --- | --- |
| `aria2c-wrapper.sh` | Replaces the bundled `aria2c`; filters unsupported SQLite options, normalizes `--version`, loads network bootstrap, enables 16-way split and 200 eD2k connections. |
| `install-engine.sh` | Copies the engine, wrapper, `server.met` and `nodes.dat` into a staged app bundle. |
| `server.met` | eD2k server list, refreshed from `upd.emule-security.org`. |
| `nodes.dat` | Kad bootstrap nodes. |
| `servers.json` | Active server metadata used by `source-lookup.py` and the wrapper. |
| `source-lookup.py` | Queries historical availability for an eD2k hash and prints matching `ip:port` servers. |
| `diagnose.py` | Prints live RPC status: LowID, server/Kad counts, port mapping and per-task peers. |

## Wrapper behaviour

```
aria2c --version
  -> aria2 version 3.1.0-motrix-ed2k
  -> Enabled Features: Async DNS, BitTorrent, Metalink

aria2c <motrix args>
  -> filter --enable-sqlite3-persistence, --sqlite3-db-path, --sqlite3-history-limit
  -> aria2-next --ed2k-server-list=... --ed2k-node-list=... --ed2k-server=...
     "${args[@]}" --split=16 --max-connection-per-server=16
     --min-split-size=1M --ed2k-max-connections=200
```

The override flags must stay **after** `"${args[@]}"`: Motrix passes its own `--min-split-size=4194304`, and the later value wins.

## Diagnostics

```bash
python3 diagnose.py
python3 source-lookup.py 'ed2k://|file|name|size|HASH|/' --servers
```

`diagnose.py` reads the RPC secret from the running `aria2-next` command line. `source-lookup.py` queries `ed2k.shortypower.org`; its result is historical availability, not a guarantee of live peers.

## Ports

- TCP `4662`
- UDP `4672`

Forward both to the Mac's LAN address for a chance at HighID. UPnP is disabled in the wrapper because the test router returned error 501.
