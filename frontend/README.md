# Quadratic Voting Frontend

A modern, responsive frontend for the Quadratic Voting system built with Arbitrum Stylus.

## Features

- 🗳️ **Quadratic Voting** - Vote cost increases quadratically (votes² = credits)
- 💳 **Wallet Integration** - MetaMask support for Arbitrum
- 📊 **Real-time Results** - Live voting results and proposal status
- 🎨 **Professional UI** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Admin Panel** - Credit distribution and management
- ✨ **Professional Icons** - Lucide React icons (no emojis)

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Blockchain**: Ethers.js v6, Arbitrum Stylus
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## Prerequisites

1. **Arbitrum Local Devnode** - Running on `http://localhost:8547`
2. **MetaMask** - Browser extension installed
3. **Deployed Stylus Contract** - The quadratic voting contract must be deployed
4. **Node.js** - Version 18 or higher

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_RPC_URL=http://localhost:8547
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### For Voters

1. **Connect Wallet** - Connect your MetaMask wallet
2. **Get Credits** - Ask admin to distribute voting credits to your address
3. **View Proposals** - Browse active proposals in the "Proposals" tab
4. **Cast Votes** - Vote "for" or "against" proposals using quadratic pricing
5. **Track Credits** - Monitor your remaining credits in real-time

### For Admins

1. **Access Admin Panel** - Go to the "Admin" tab
2. **Distribute Credits** - Send voting credits to community members
3. **Bulk Import** - Paste multiple addresses for credit distribution
4. **Monitor Usage** - Track credit distribution and usage

### For Proposal Creators

1. **Create Proposals** - Go to the "Create" tab
2. **Add Details** - Provide title and description
3. **Submit** - Your proposal goes live immediately
4. **Track Results** - Monitor voting progress and results

## Quadratic Voting Explained

- **1 vote** costs **1 credit**
- **2 votes** cost **4 credits** (2²)
- **3 votes** cost **9 credits** (3²)

This prevents wealthy participants from dominating while allowing strong preferences to be expressed.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Base UI components
│   └── *.tsx           # Feature components
├── contexts/           # React contexts
├── lib/                # Utilities and services
├── types/              # TypeScript type definitions
└── constants/          # Application constants
```

## Contract Integration

The frontend integrates with the Stylus Quadratic Voting contract through:

- **QuadraticVotingService**: Main contract interaction service
- **ABI**: Contract interface definition  
- **Types**: TypeScript interfaces for contract data
- **Error Handling**: User-friendly error messages

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

3. Update environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
