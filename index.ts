import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import fs from 'fs'

async function main() {
    const connection = new Connection(clusterApiUrl("devnet"));
    // const wallet = Keypair.generate();
    // const wallet = await createKeypairFromFile('signer.json');
    const walletSecretKeyString = fs.readFileSync('signer.json', {encoding: 'utf8'});
    const walletSecretKey = Uint8Array.from(JSON.parse(walletSecretKeyString));
    let wallet = Keypair.fromSecretKey(walletSecretKey);

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            }),
        );

    const buffer = fs.readFileSync("image.png");
    const file = toMetaplexFile(buffer, "image.png");

    const imageUri = await metaplex.storage().upload(file);

    const { uri } = await metaplex.nfts().uploadMetadata({
        name: "My NFT",
        description: "My description",
        image: imageUri,
    });

    const { nft } = await metaplex.nfts().create(
        {
            uri: uri,
            name: "My NFT",
            sellerFeeBasisPoints: 0,
        },
        { commitment: "finalized" },
    );

    console.log(nft)
}
main()