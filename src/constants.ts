
import { Book, Announcement } from './types';

export const CHARS_PER_PAGE = 650;

const luminaPressBooks: Book[] = [
  {
    id: 'pub-1',
    title: "Moby Dick",
    author: 'Herman Melville',
    coverUrl: 'https://picsum.photos/seed/mobydick/400/600',
    price: '$0.00',
    content: `Chapter 1: Loomings\n\nCall me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball.\n\n[IMAGE:https://picsum.photos/seed/mobydick-ship/800/500]\n\nWith a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.`,
    isEpub: false,
  },
  {
    id: 'pub-2',
    title: 'Echoes of Starlight',
    author: 'Kaelen Rourke',
    coverUrl: 'https://picsum.photos/seed/echoesstarlight/400/600',
    price: '$9.99',
    content: `Prologue\n\nFrom the observation deck of the Starship Voyager, the universe was a tapestry of infinite black velvet, sprinkled with the diamond dust of distant galaxies. Commander Eva Rostova gazed at the swirling nebula of Cygnus X-1, her reflection a faint ghost on the reinforced plasteel viewport. Twenty years. Twenty years she had been out here, in the deep void, chasing echoes. The 'Echoes,' as her crew called them, were faint, ghost-like signals that defied all known physics. They were patterns without a source, messages without a sender. Some believed they were the dying breaths of a long-dead civilization. Others, more fancifully, called them the whispers of God.\n\n[IMAGE:https://picsum.photos/seed/echoesstarlight-art1/800/500]\n\nEva was a scientist. She dealt in data, in proof, in the tangible. But even she couldn't deny the haunting beauty of the signals. They sang a melancholic song of cosmic loneliness, a song that resonated with a place deep inside her she rarely acknowledged. Her mission was simple: find the source. But the journey had been anything but. They had navigated asteroid fields that danced like angry hornets, weathered solar flares that threatened to peel their ship apart, and stared into the maddening abyss of black holes. Through it all, the Echoes were their constant companion, a siren's call leading them deeper into the unknown. Tonight, the signals were stronger than ever. The ship's chief science officer, a young, brilliant man named Jax, confirmed her thoughts. "Commander," his voice crackled over the intercom, "the resonance frequency is off the charts. We're close. Whatever 'it' is, it's just beyond this nebula." Eva took a deep breath, the recycled air tasting of ozone and anticipation. "Take us in, Mr. Jax," she said, her voice steady despite the tremor in her hands. "Let's see who's been singing to us all this time."`
  },
  { id: 'pub-3', title: 'City of Brass and Fire', author: 'Nadia Al-Farsi', price: '$9.99', coverUrl: 'https://picsum.photos/seed/citybrass/400/600', content: 'A sprawling epic set in a magical city where djinn and humans coexist in a fragile peace. But a dark power is rising, threatening to shatter their world into chaos and flame.' },
  { id: 'pub-4', title: 'The Last Timekeeper', author: 'Simon Glass', price: '$7.99', coverUrl: 'https://picsum.photos/seed/timekeeper/400/600', content: 'In a world where time can be bottled and sold, the last true Timekeeper must protect the Great Clock from a corporation that wants to control the past, present, and future.' },
];

const blueleafBooks: Book[] = [
    { id: 'bl-1', title: 'The Silent Grove', author: 'Elara Vance', price: '$0.00', coverUrl: 'https://picsum.photos/seed/silentgrove/400/600', content: 'In a forest where trees whisper secrets, a young druid must uncover a plot that threatens to silence the woods forever.'},
    { id: 'bl-2', title: 'River of a Thousand Faces', author: 'Chen Yue', price: '$8.99', coverUrl: 'https://picsum.photos/seed/riverfaces/400/600', content: 'A mystical river grants visions to those who drink from it. A traveling monk seeks its source, hoping to find enlightenment, but discovers the river has a will of its own.'},
    { id: 'bl-3', title: 'The Thorn Witch', author: 'Briar Rosewood', price: '$9.99', coverUrl: 'https://picsum.photos/seed/thornwitch/400/600', content: 'A reclusive witch, protector of a cursed castle, finds her solitude shattered by a knight who believes she holds the key to his redemption.'},
];

const sunstoneBooks: Book[] = [
    { id: 'ss-1', title: 'Chronicles of the Sunstone', author: 'Aidan Sol', price: '$0.00', coverUrl: 'https://picsum.photos/seed/sunstonechronicles/400/600', content: 'A legendary gem, the Sunstone, is stolen from a desert kingdom, plunging it into eternal twilight. A young warrior must retrieve it from a city of shadows.'},
    { id: 'ss-2', title: 'Crimson Peak', author: 'Rory Scarlett', price: '$12.99', coverUrl: 'https://picsum.photos/seed/crimsonpeak/400/600', content: 'On a volcanic island, an ancient fire god is reawakening. A volcanologist and a local shaman must team up to appease the deity before their home is consumed by lava.'},
    { id: 'ss-3', title: 'The Phoenix Rider', author: 'Ignatius Drake', price: '$10.99', coverUrl: 'https://picsum.photos/seed/phoenixrider/400/600', content: 'Only one rider can bond with the legendary phoenix. The fate of the empire rests on a young orphan who must prove her worth in a deadly tournament.'},
];

[...luminaPressBooks, ...blueleafBooks, ...sunstoneBooks].forEach(book => {
    if (book.id === 'pub-1' || book.id === 'pub-2') return;
    book.content += `\n\nChapter 2: The Journey Begins\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Sorbi in justo.`;
});


const luminaPressAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    type: 'popup',
    title: 'New Release: "City of Brass and Fire"',
    message: 'Nadia Al-Farsi\'s sprawling epic is now available! Dive into a world of djinn, magic, and a fragile peace threatened by a rising dark power. Add it to your library today.',
    imageUrl: 'https://picsum.photos/seed/citybrass/800/400',
    ctaText: 'Add to My Library',
    ctaLink: 'pub-3',
  },
  {
    id: 'announcement-2',
    type: 'notification',
    title: 'Meet the Author: Kaelen Rourke',
    message: 'Join us for a live Q&A with the author of "Echoes of Starlight" this Friday. Don\'t miss out!',
    ctaText: 'Learn More',
    ctaLink: 'event-1',
  },
  {
    id: 'announcement-3',
    type: 'notification',
    title: 'Limited Time Offer!',
    message: 'Get "The Last Timekeeper" for 50% off this weekend only. Don\'t miss out!',
    ctaText: 'Claim Offer',
    ctaLink: 'pub-4',
    requiresPush: true,
  }
];

const blueleafAnnouncements: Announcement[] = [
  {
    id: 'announcement-bl-1',
    type: 'popup',
    title: 'Discover "The Thorn Witch"',
    message: 'Briar Rosewood\'s new dark fantasy is here. Explore a cursed castle and a love that blooms like a defiant rose. Get your copy now.',
    imageUrl: 'https://picsum.photos/seed/thornwitch_announce/800/400',
    ctaText: 'Explore the Tale',
    ctaLink: 'bl-3',
  },
];

const sunstoneAnnouncements: Announcement[] = [
   {
    id: 'announcement-ss-1',
    type: 'notification',
    title: 'The Phoenix Rider has Arrived!',
    message: 'The most anticipated fantasy novel of the year is finally here. Join the epic journey today!',
    ctaText: 'Buy Now',
    ctaLink: 'ss-3',
  },
];

interface PublisherData {
  books: Book[];
  announcements: Announcement[];
}

export const PUBLISHER_DATA: Record<string, PublisherData> = {
  lumina: {
    books: luminaPressBooks,
    announcements: luminaPressAnnouncements,
  },
  blueleaf: {
    books: blueleafBooks,
    announcements: blueleafAnnouncements,
  },
  sunstone: {
    books: sunstoneBooks,
    announcements: sunstoneAnnouncements,
  },
};
