# MON GRAFFITI 🎨⚡

> **Multiplayer Map Art Canvas & NFT Bidding Marketplace on Monad Testnet**

[![Live Demo](https://img.shields.io/badge/Live_Demo-mongraffiti.vercel.app-836EF9?style=for-the-badge&logo=vercel)](https://mongraffiti.vercel.app)
[![Network](https://img.shields.io/badge/Network-Monad_Testnet_(10143)-FF5E97?style=for-the-badge&logo=ethereum)](https://testnet.monadvision.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**MON Graffiti** transforms the world map into a shared, real-time digital canvas for street art, crypto culture, and NFT collecting. 

Users can pin custom graffiti drawings to real-world locations (centered over India & global culture hubs), mint their artwork as **ERC-721 NFTs** on **Monad Testnet**, place **MON token bids**, and synchronize live artwork updates across all connected browsers using **Supabase Realtime**.

---

## 🔗 Live Links & Deployed Contracts

| Resource | Link / Address |
| :--- | :--- |
| 🌐 **Live Web Application** | [https://mongraffiti.vercel.app](https://mongraffiti.vercel.app) |
| 🐙 **GitHub Repository** | [https://github.com/Mugunth007/MonGraffiti](https://github.com/Mugunth007/MonGraffiti) |
| 📜 **MonGraffitiNFT Contract** | [`0x91118D0347894CAF37f1Fe3B2A210D54d2F3bE17`](https://testnet.monadvision.com/address/0x91118D0347894CAF37f1Fe3B2A210D54d2F3bE17) |
| 📜 **MonGraffiti Registry Contract** | [`0xCec8d979Ae7B13387D2981BE02ed2F5034ebAC43`](https://testnet.monadvision.com/address/0xCec8d979Ae7B13387D2981BE02ed2F5034ebAC43) |
| ⛓️ **Monad Testnet RPC** | `https://testnet-rpc.monad.xyz` (Chain ID: `10143`) |

---

## ✨ Key Features

- 🗺️ **Real-Time Multiplayer Map**: Focused on India (Bengaluru, Delhi, Mumbai, Chennai, etc.) with high-resolution dark map tiles.
- ⚡ **Supabase Realtime Stream**: New graffitis appear instantly across all connected screens worldwide without page refresh.
- 🎨 **In-Browser Drawing Editor**: Freehand brush tool, eraser, color palette, brush size slider, text overlay, and live map thumbnail preview.
- 🦊 **Web3 Native Authentication**: MetaMask / Rabby / Phantom connection with automatic Monad Testnet (`0x279f`) network switching.
- 🖼️ **On-Chain NFT Minting & Bidding**: Mint drawings as ERC-721 NFTs, place MON token bids on-chain, or buyout artworks instantly.
- 💖 **On-Chain Likes & MON Tips**: Record likes on-chain and send MON token tips directly to artists.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Map Engine**: Leaflet & OpenStreetMap / CartoDB Dark Matter tile layer
- **Database & Storage**: Supabase PostgreSQL, Supabase Storage, Supabase Realtime Broadcasts
- **Blockchain / Smart Contracts**: Solidity (0.8.24), Foundry (Forge), Ethers.js v6
- **Network**: Monad Testnet (Chain ID `10143`)

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Mugunth007/MonGraffiti.git
cd MonGraffiti
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Supabase Database Setup

Run the SQL script in `supabase/schema.sql` inside your **Supabase SQL Editor**:

```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.graffitis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  remix_parent_id UUID REFERENCES public.graffitis(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.graffitis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on graffitis" ON public.graffitis FOR SELECT USING (true);
CREATE POLICY "Allow public insert on graffitis" ON public.graffitis FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on graffitis" ON public.graffitis FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.graffitis;
```

---

## 🏗️ Smart Contract Deployment (Foundry / Forge)

Solidity smart contracts are located in the `contracts/` directory.

### Run Tests in Git Bash

```bash
cd contracts
forge test
```

### Deploy to Monad Testnet

```bash
forge create src/MonGraffitiNFT.sol:MonGraffitiNFT \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key YOUR_MONAD_PRIVATE_KEY \
  --broadcast
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
