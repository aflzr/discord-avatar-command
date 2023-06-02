const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  PermissionsBitField,
  ChannelType,
  Client,
  GatewayIntentBits,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  REST,
  Routes,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const Canvas = require("canvas");

client.on("interactionCreate", async (i) => {
  if (i.commandName === "avatar") {
    const user = await client.users.fetch(i.options.getUser("user").id, {
      force: true,
    });

    await i.deferReply();
    const canvas = Canvas.createCanvas(299, 220);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage("./avatar.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (user.bannerURL() !== null) {
      const banner = await Canvas.loadImage(
        user.bannerURL({ dynamic: true, size: 2048, format: "jpg" })
      );

      ctx.drawImage(banner, 0, 0, canvas.width, 123);
    } else if (user.hexAccentColor != null) {
      const banner = await Canvas.loadImage(
        `https://singlecolorimage.com/get/${user.hexAccentColor.replace(
          /#/g,
          ""
        )}/400x100.png`
      );

      ctx.drawImage(banner, 0, 0, canvas.width, 123);
    }

    ctx.font = "bold 17px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${user.tag}`, 21, 200);

    const border = await Canvas.loadImage("./border.jpg");
    const avatar = await Canvas.loadImage(
      user.displayAvatarURL({ extension: "jpg", size: 1024 })
    );

    const borderSize = 101;
    const avatarSize = 81;

    const centerX = 21.5 + avatarSize / 2;
    const centerY = 80 + avatarSize / 2;

    const newBorderSize = borderSize * 0.9;

    const borderX = centerX - newBorderSize / 2;
    const borderY = centerY - newBorderSize / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, newBorderSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(border, borderX, borderY, newBorderSize, newBorderSize);

    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatar,
      centerX - avatarSize / 2,
      centerY - avatarSize / 2,
      avatarSize,
      avatarSize
    );

    const attachment = new AttachmentBuilder(canvas.toBuffer(), "avatar.jpg");
    i.editReply({
      files: [attachment],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("getAvatar")
            .setLabel("Avatar")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("getBanner")
            .setLabel("Banner")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("getServerIcon")
            .setLabel("Server Icon")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });

    const collector = i.channel.createMessageComponentCollector({
      time: 60_000 * 5,
    });
    collector.on("collect", async (e) => {
      if (!e.isButton()) return;
      i.fetchReply().then(async (ei) => {
        if (e.message.id != ei.id) return;
        if (e.customId === "getAvatar") {
          await i.editReply({
            embeds: [
              new EmbedBuilder().setColor("#2C2D31").setImage(
                user.displayAvatarURL({
                  size: 2048,
                })
              ),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("getAvatar")
                  .setLabel("Avatar")
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("getBanner")
                  .setLabel("Banner")
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("getServerIcon")
                  .setLabel("Server Icon")
                  .setStyle(ButtonStyle.Primary)
              ),
            ],
          });
          e.deferUpdate();
        }
        if (e.customId === "getBanner") {
          if (!user.bannerURL())
            return (async function () {
              let pbnr = `https://singlecolorimage.com/get/ffffff/571x201.png`;

              if (user.hexAccentColor != null)
                pbnr = `https://singlecolorimage.com/get/${user.hexAccentColor.replace(
                  /#/g,
                  ""
                )}/571x201.png`;

              await i.editReply({
                embeds: [new EmbedBuilder().setColor("#2C2D31").setImage(pbnr)],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("getAvatar")
                      .setLabel("Avatar")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("getBanner")
                      .setDisabled(true)
                      .setLabel("Banner")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("getServerIcon")
                      .setLabel("Server Icon")
                      .setStyle(ButtonStyle.Primary)
                  ),
                ],
              });
              e.deferUpdate();
            })();
          await i.editReply({
            embeds: [
              new EmbedBuilder().setColor("#2C2D31").setImage(
                user.bannerURL({
                  size: 2048,
                })
              ),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("getAvatar")
                  .setLabel("Avatar")
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("getBanner")
                  .setDisabled(true)
                  .setLabel("Banner")
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("getServerIcon")
                  .setLabel("Server Icon")
                  .setStyle(ButtonStyle.Primary)
              ),
            ],
          });
          e.deferUpdate();
        }
        if (e.customId === "getServerIcon") {
          if (!i.guild.iconURL())
            return (async function () {
              await e.reply({
                ephemeral: true,
                content: `**- i dont see any server icon**`,
              });
            })();

          await i.editReply({
            embeds: [
              new EmbedBuilder().setColor("#2C2D31").setImage(
                i.guild.iconURL({
                  size: 2048,
                })
              ),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("getAvatar")
                  .setLabel("Avatar")
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("getBanner")
                  .setLabel("Banner")
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId("getServerIcon")
                  .setLabel("Server Icon")
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Primary)
              ),
            ],
          });
          e.deferUpdate();
        }
      });
    });
  }
});
/////////////////////// command
const cmd = [
  {
    name: "avatar",
    description: "To see someone's avatar",
    options: [
      {
        name: "user",
        description: "user you want to see his avatar",
        required: true,
        type: 6,
      },
    ],
  },
];
/////////////////////// build
const rest = new REST().setToken(process.env.token);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.clientId), {
      body: cmd,
    });

    console.log("#Slash Commands Saved");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`${client.user.tag} is on`);
});
client.login(process.env.token);