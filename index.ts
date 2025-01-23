import { Client, Message, TextChannel, type OmitPartialGroupDMChannel } from "discord.js"
import dotenv from "dotenv"
import { Client as GClient } from "@gradio/client";
import { ContentType } from "./content-type";
import { ChannelWhitelist } from "./channel-whitelist";

dotenv.config()

const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "DirectMessages"]
})
const gclient = await GClient.connect("Boboiazumi/polisi-moral");

client.once("ready", () => console.log("Polisi Moral is Ready"))

client.on("messageCreate", async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try{
        if(!ChannelWhitelist.includes(message.channel.id)) return

        let nsfw_count = 0
        for(let i = 0; i < message.attachments.size; i++){
            if(message.attachments.at(i)?.contentType && ContentType.includes(<string>message.attachments.at(i)?.contentType)){
                const image = await (await fetch(<string>message.attachments.at(i)?.url)).blob()
                const result = await gclient.predict("/inference", { 
                    image, 
                });
                const inference = (result.data as string[])[0]
    
                if(inference.includes("nsfw")){
                    nsfw_count += 1
                    console.log(`[${new Date().toISOString()}] Found NSFW Content ! [User : ${message.author.toString()}]`)
                }
            }
        }
    
        if(nsfw_count > 0){
            await (client.channels.cache.get('1331942708633145344') as TextChannel).send(`${message.author.toString()} mengirimkan konten nsfw di ${message.guild?.channels.cache.get(message.channel.id.toString())?.toString()}`)
            await message.reply(`${message.author.toString()} Maaf pak, gambar yang anda kirim mengandung konten nsfw yang tidak layak dilihat anak kecil. Pesan anda sudah dihapus, tolong lapor kepada admin jika ini merupakan sebuah kesalahan. Hormat Kami Polisi Moral IMPHNEN`)
            await message.delete()
        }
    }
    catch (err){
        console.log(`[${new Date().toISOString()}] Error ${(err as Error).message}`)
    }
})

client.on("error", (error) => {
    console.log(`[${new Date().toISOString()}] Error ${(error).message}`)
})

client.login(process.env.DISCORD_TOKEN)