# mint
Mint is a CLI-based file sharing and hosting service
## Features
* **Secure and private**: Mint itself never looks at your files- only hosts see them when you upload. In addition, Mint verifies the SHA256 hash of a file when downloading it to ensure that no malicious code is downloaded if a trusted source gave you the hash.
* **Fast**: Mint is designed to be as lightweight on the upload/download process as possible- adding almost no latency to direct communications between the client and host.
* **Easy**: All you need to get started with Mint are two commands: `mint upload` and `mint download`. Adding more hosts or configuring identities is as easy as pasting in a few lines of JSON provided by the host.
## Quickstart
This guide is a quickstart to get you sharing and downloading ASAP on Mint!
### Installation and Test
First, install Mint:
```sh
pip install mintfsh
```
Then, check if it's installed:
```
which mint
```
If it returns a path, great! If not, add your Python package directory to `PATH`. To test Mint, run:
```
mint download test
```
It will ask you if you'd like Mint to create a configuration file for you. Type `y` or just press enter to continue and Mint will automatically create the configuration for you. Then, Mint will download the file `test.txt` for you- run `cat test.txt` or open it in a text editor to see some info about the request and host!
### Downloading/uploading
The default config comes with a preconfigured official Mint host! It will work fine for testing/casual sharing, but keep in mind:
* 750MB file size limit
* Deletes files after 7 days
* One file per filename
* Latency

Just run:
```
mint upload <filename>
```
And it will output a SHA256 hash for the file, like:
```
cdfb539da64eaef7bc2705ef750f0aafd69ed5662bfea972b370ec6728aa812a
```
Then, if we want to download that same file from somewhere else (with the same host of course):
```
mint download cdfb539da64eaef7bc2705ef750f0aafd69ed5662bfea972b370ec6728aa812a
```
This specific example will not upload because this file has *already* been uploaded to Mint. This means the actual file, not the file name. However, downloading this will download yet another test file (called `cdfb539da64eaef7bc2705ef750f0aafd69ed5662bfea972b370ec6728aa812a.mintdownload`) with a success message.
## Quickstart for hosts
So, you want to set up a Mint host! Running a Mint host is a great way to promote equal access to code and important info, and also a fun learning experience. Mint provides three options for hosting: Serverless (cleanest and easiest, though limited control over features like autoclean), Flask-based, and Node-based.
### Prerequisites
* If you're planning on using the Flask host, make sure you have Mint installed:
```
pip install mintfsh
```
* Space on your machine- Mint will make sure that you don't run out, but have at least 5GB available. If you're using the Serverless host, don't worry about this- all storage is managed by Vercel.
* Good uptime- to be a great host, where many people trust you to be on their hosts list, you will want good uptime. Don't use something like a personal laptop if you plan on keeping it as a serious host, unless you can keep it on for around 95% of the time. This, again, doesn't apply to serverless hosts- these have essentially 100% uptime because they run on demand. 
## Flask host (easiest for local testing)
The Flask-based host is easy to set up. Again, make sure you have Mint installed, then run:
```
mint-host 3000
```
The command takes in other options too:
```
mint host 1234 --maxfs 750 --autodel 7 --cleaninterval 5
```
These are optional, but they let you set the port, max file size, autodelete time, and cleanup interval respectively.

You will need to either host this on a VPS, dedicated Flask host, or set up DDNS + port forwarding. 
## Deploying Mint Host on Vercel (Serverless)

### 1. Clone the repo

```bash
git clone https://github.com/giacomosmcodes/mint.git
cd mint/mint-host
```

### 2. Set your Vercel Blob user ID

Edit `api/[hash].js`:

```js
const userId = "your-vercel-user-id.public";
```

Replace `"your-vercel-user-id"` with your actual **Vercel user ID**, not your username.  
You can find it in the URL when creating a blob store, or by checking an existing one.

### 3. Install Vercel CLI and log in

```bash
npm install -g vercel
vercel login
```

### 4. Deploy

```bash
vercel --prod
```

### 5. Create your blob store

```bash
vercel blob create your-vercel-user-id.public
```

Copy the `BLOB_READ_WRITE_TOKEN` returned.

### 6. Add the token to your Vercel project

In the Vercel dashboard:

- Go to your project → Settings → Environment Variables
- Key: `BLOB_READ_WRITE_TOKEN`
- Value: your token
- Environment: Production

Then redeploy:

```bash
vercel --prod
```

### Done :)
you have a mint host now, yay! share the url with your friends
## Node host (advanced)
Express is preferred to Flask for more serious services that want more features such as token management integrated with their own backend. To run this, simply go to the mint repo and download `mint-host/full_server.js`. Then, run it with Node, and change the constants at the top if needed. This gives you the most control over your Mint host.
## Using it
It will run on `localhost:3000` by default, which is in the default Mint hosts list. To share it with the world, you can:
* Find a hosting provider (VPS, dedicated Node hosts can also be found for a small fee)
* Set up port forwarding and use your IP/a domain you own (complicated unless you've done this before).
* Set up a tunnel (for example, cloudflared) to your computer. This is easy, but requires a credit card on file- if you use cloudflare, you MUST use a named tunnel- not an ephemeral tunnel (free cloudflare, ngrok, localtunnel).
## Spread the word
Share it in relevant Mint communities on Slack, Discord, Reddit, and so on. Get people to add it to their host list, and you're done! Hosts with a domain and good uptime will be mentioned in the official hostlist (`HOSTS.md`)-  a great way to gain trust in users. Note that hosts must provide full upload and download to be added.