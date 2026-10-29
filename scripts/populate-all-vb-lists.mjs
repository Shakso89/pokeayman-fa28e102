import { login, fetchImageForWord, insertRecord, SCHOOL, CLASS_NAME, TEACHER_NAME } from './create-vocab-lists.mjs';

const LISTS = [
  {
    name: "VB 6",
    coverQuery: "elephant wildlife",
    words: [
      { word: "eight", sentence: "There are eight crayons in the box.", query: "eight number digits" },
      { word: "elephant", sentence: "The big elephant has very large ears.", query: "African Elephant" },
      { word: "eleven", sentence: "My brother is eleven years old today.", query: "eleven number" },
      { word: "eye", sentence: "She closed her eyes and made a wish.", query: "human blue eye" },
      { word: "fine", sentence: "I feel very fine and happy today.", query: "sunny day landscape" },
      { word: "fish", sentence: "A little gold fish swims in the water.", query: "goldfish aquarium" },
      { word: "five", sentence: "I have five fingers on my right hand.", query: "number five" }
    ]
  },
  {
    name: "VB 7",
    coverQuery: "green frog nature",
    words: [
      { word: "floor", sentence: "The cat is sleeping on the clean floor.", query: "wood floor interior" },
      { word: "football", sentence: "The boys like to play football after school.", query: "football soccer ball" },
      { word: "four", sentence: "There are four yellow birds in the tree.", query: "number four" },
      { word: "frog", sentence: "A little green frog can jump very far.", query: "tree frog green" },
      { word: "girl", sentence: "The happy girl is reading an interesting book.", query: "school girl reading" },
      { word: "glass", sentence: "Please drink a glass of fresh water.", query: "drinking glass water" },
      { word: "go", sentence: "We can go to the playground together now.", query: "green traffic light go" }
    ]
  },
  {
    name: "VB 8",
    coverQuery: "green grapes fruit",
    words: [
      { word: "good", sentence: "He is a good student in our English class.", query: "thumbs up good" },
      { word: "goodbye", sentence: "She said goodbye to her teacher and went home.", query: "waving goodbye hand" },
      { word: "grape", sentence: "I like to eat sweet purple grapes for lunch.", query: "purple grapes fruit" },
      { word: "gray", sentence: "The cute little rabbit has soft gray fur.", query: "gray color rabbit" },
      { word: "green", sentence: "Look at the tall green tree in the garden.", query: "green leaf nature" },
      { word: "hair", sentence: "My sister has long brown hair and blue eyes.", query: "long brown hair" },
      { word: "hand", sentence: "Please raise your hand if you know the answer.", query: "human open hand" }
    ]
  },
  {
    name: "VB 9",
    coverQuery: "smiling happy child",
    words: [
      { word: "happy", sentence: "We are all very happy on sunny days.", query: "happy child smile" },
      { word: "have", sentence: "I have a new colorful bag for school.", query: "school backpack" },
      { word: "he", sentence: "He is my best friend in the classroom.", query: "young boy smiling" },
      { word: "head", sentence: "Wear a warm hat on your head in winter.", query: "head winter beanie" },
      { word: "hello", sentence: "She smiled and said hello to the new teacher.", query: "friendly wave hello" },
      { word: "here", sentence: "Please come here and sit down with your classmates.", query: "classroom chairs" }
    ]
  },
  {
    name: "VB 10",
    coverQuery: "horse galloping meadow",
    words: [
      { word: "hi", sentence: "Say hi to your friends every morning at school.", query: "kids greeting high five" },
      { word: "home", sentence: "We walk home together after class every day.", query: "cozy family house" },
      { word: "horse", sentence: "The brown horse runs very fast across the grass.", query: "brown horse running" },
      { word: "hot", sentence: "The summer sun is very hot in the afternoon.", query: "bright summer sun" },
      { word: "house", sentence: "They live in a beautiful house near the park.", query: "suburban family house" },
      { word: "how", sentence: "Can you tell me how to spell your name?", query: "child thinking question" },
      { word: "I", sentence: "I like to draw cute pictures with colorful pens.", query: "child drawing with crayons" },
      { word: "ice", sentence: "Please put some cold ice into my cup.", query: "clear ice cubes" }
    ]
  },
  {
    name: "VB 11",
    coverQuery: "delicious ice cream",
    words: [
      { word: "ice cream", sentence: "Chocolate ice cream is my favorite cold summer treat.", query: "ice cream cone" },
      { word: "in", sentence: "The yellow pencils are in the pencil case.", query: "pencils in pencil case" },
      { word: "it", sentence: "It is a sunny and wonderful day today.", query: "sunny blue sky" },
      { word: "juice", sentence: "I like to drink fresh orange juice every morning.", query: "fresh orange juice glass" },
      { word: "kangaroo", sentence: "The mother kangaroo carries her baby in her pouch.", query: "kangaroo with joey" },
      { word: "leg", sentence: "A bird has two legs to walk on branches.", query: "running sneakers legs" },
      { word: "lemon", sentence: "The yellow lemon has a very sour taste.", query: "fresh yellow lemon" }
    ]
  },
  {
    name: "VB 12",
    coverQuery: "lion wildlife",
    words: [
      { word: "let", sentence: "Please let your friend play with the new toy.", query: "children sharing toy" },
      { word: "light", sentence: "Please turn on the light when reading your book.", query: "desk reading lamp light" },
      { word: "like", sentence: "I like to read funny storybooks with my sister.", query: "reading books together" },
      { word: "lion", sentence: "The strong lion rests under the big shady tree.", query: "male lion portrait" },
      { word: "little", sentence: "A little brown puppy is playing in the yard.", query: "cute little puppy" },
      { word: "long", sentence: "The giraffe has a very long neck to reach leaves.", query: "giraffe long neck" },
      { word: "man", sentence: "The kind man helped the lost puppy find home.", query: "friendly adult man" }
    ]
  },
  {
    name: "VB 13",
    coverQuery: "cute monkey branch",
    words: [
      { word: "many", sentence: "There are many colorful flowers blooming in the garden.", query: "field of many flowers" },
      { word: "melon", sentence: "We shared a sweet juicy melon on a hot day.", query: "ripe sweet melon fruit" },
      { word: "mom", sentence: "My mom cooks delicious dinner for our family.", query: "mother and child happy" },
      { word: "monkey", sentence: "The funny monkey climbs high in the jungle trees.", query: "capuchin monkey" },
      { word: "mouse", sentence: "A tiny mouse was hiding behind the kitchen door.", query: "small field mouse" },
      { word: "mouth", sentence: "Please open your mouth so the dentist can look.", query: "smiling open mouth teeth" }
    ]
  },
  {
    name: "VB 14",
    coverQuery: "alarm clock time",
    words: [
      { word: "name", sentence: "My name is written clearly on my notebook cover.", query: "nametag sticker hello" },
      { word: "nine", sentence: "There are nine bright stars in the night sky.", query: "number nine digit" },
      { word: "no", sentence: "There is no noise in the quiet library today.", query: "red stop sign" },
      { word: "nose", sentence: "The cute dog touched my hand with its nose.", query: "puppy wet nose" },
      { word: "not", sentence: "I am not afraid of the dark room anymore.", query: "thumbs down no" },
      { word: "number", sentence: "Seven is my favorite lucky number in math class.", query: "colorful math numbers" },
      { word: "o'clock", sentence: "School starts at eight o'clock in the morning.", query: "analog wall clock 8 oclock" }
    ]
  },
  {
    name: "VB 15",
    coverQuery: "giant panda bamboo",
    words: [
      { word: "OK", sentence: "Everything is OK and we are ready to begin.", query: "hand sign ok gesture" },
      { word: "old", sentence: "My grandfather loves to tell old stories to us.", query: "elderly grandfather smiling" },
      { word: "on", sentence: "The blue backpack is resting on the brown desk.", query: "book on desk" },
      { word: "one", sentence: "I have only one apple left in my bag.", query: "number one digit" },
      { word: "orange", sentence: "She peeled a sweet and juicy orange for breakfast.", query: "fresh ripe orange fruit" },
      { word: "out", sentence: "The children ran out to play in the sunshine.", query: "exit open door sunny" },
      { word: "panda", sentence: "The black and white panda loves eating fresh bamboo.", query: "giant panda eating bamboo" }
    ]
  },
  {
    name: "VB 16",
    coverQuery: "sweet pineapple tropical",
    words: [
      { word: "peach", sentence: "The soft peach tastes very sweet and juicy today.", query: "fresh ripe peach fruit" },
      { word: "pear", sentence: "I ate a green pear with my lunch sandwich.", query: "green pear fruit" },
      { word: "pen", sentence: "Please use a blue pen to write your homework.", query: "ballpoint writing pen" },
      { word: "pencil", sentence: "Sharpen your pencil before the English test begins.", query: "yellow sharpened pencil" },
      { word: "pig", sentence: "The pink pig is rolling happily in the mud.", query: "pink piglet farm" },
      { word: "pineapple", sentence: "A tropical pineapple has sweet yellow fruit inside.", query: "whole pineapple fruit" },
      { word: "pink", sentence: "She wore a pretty pink dress to the party.", query: "pink rose flower" }
    ]
  },
  {
    name: "VB 17",
    coverQuery: "white rabbit grass",
    words: [
      { word: "play", sentence: "Let us play an exciting game together at recess.", query: "children playing outdoors" },
      { word: "please", sentence: "Please pass the storybook to your classmate.", query: "polite handshake please" },
      { word: "purple", sentence: "The artist painted a purple flower on the canvas.", query: "purple lavender flowers" },
      { word: "queen", sentence: "The queen wore a shiny gold crown on head.", query: "gold royal crown" },
      { word: "rabbit", sentence: "The white rabbit hopped quickly across the green grass.", query: "white bunny rabbit" },
      { word: "red", sentence: "She picked a bright red apple from the tree.", query: "red ripe apple" },
      { word: "ruler", sentence: "Use your ruler to draw a straight neat line.", query: "wooden metric ruler" }
    ]
  },
  {
    name: "VB 18",
    coverQuery: "fluffy sheep pasture",
    words: [
      { word: "sad", sentence: "Do not be sad because tomorrow will be better.", query: "sad teddy bear" },
      { word: "school", sentence: "We walk to elementary school together every single morning.", query: "elementary school building" },
      { word: "see", sentence: "I can see beautiful birds flying in the sky.", query: "looking through binoculars see" },
      { word: "seven", sentence: "There are seven days in every single week.", query: "number seven digit" },
      { word: "she", sentence: "She is reading a wonderful fairytale to her sister.", query: "young schoolgirl portrait" },
      { word: "sheep", sentence: "The fluffy white sheep graze calmly on the hillside.", query: "white fluffy sheep meadow" },
      { word: "shirt", sentence: "He put on a clean white shirt for school.", query: "collared cotton shirt" }
    ]
  },
  {
    name: "VB 19",
    coverQuery: "soccer ball grass field",
    words: [
      { word: "shoes", sentence: "Tie your running shoes tightly before the big race.", query: "pair of running sneakers" },
      { word: "short", sentence: "The little dog has four very short cute legs.", query: "corgi short legs" },
      { word: "shorts", sentence: "He wears blue shorts when playing outside in summer.", query: "denim summer shorts" },
      { word: "sing", sentence: "The cheerful children sing a song in music class.", query: "child singing microphone" },
      { word: "six", sentence: "There are six eggs in the cardboard carton box.", query: "number six digit" },
      { word: "skirt", sentence: "She wore a pretty blue skirt to the concert.", query: "pleated skirt clothing" },
      { word: "snake", sentence: "The long green snake glides quietly through grass.", query: "green vine snake" },
      { word: "soccer", sentence: "We kick the soccer ball into the goal net.", query: "soccer ball field" }
    ]
  },
  {
    name: "VB 20",
    coverQuery: "school classroom teacher",
    words: [
      { word: "socks", sentence: "Put on your warm socks before wearing your shoes.", query: "colorful cotton socks" },
      { word: "song", sentence: "We learned a lovely new song in English class.", query: "musical notes sheet" },
      { word: "table", sentence: "We sit around the wooden table to eat dinner.", query: "wooden dining table" },
      { word: "taxi", sentence: "The yellow taxi stopped in front of the hotel.", query: "yellow taxi cab city" },
      { word: "teacher", sentence: "Our kind teacher explains the lesson clearly to everyone.", query: "teacher classroom students" },
      { word: "telephone", sentence: "The telephone rang loudly in the living room yesterday.", query: "classic landline telephone" }
    ]
  },
  {
    name: "VB 21",
    coverQuery: "tennis court match",
    words: [
      { word: "ten", sentence: "Count from one to ten slowly and carefully today.", query: "number ten digit" },
      { word: "tennis", sentence: "They play tennis together on Saturday morning at court.", query: "tennis racket yellow ball" },
      { word: "thank you", sentence: "Always say thank you when someone gives you help.", query: "thank you written note" },
      { word: "thanks", sentence: "Many thanks for helping me with my heavy bag.", query: "giving flowers thank you" },
      { word: "that", sentence: "Look at that colorful kite flying high up there.", query: "flying colorful kite" },
      { word: "the", sentence: "The bright golden sun shines over the quiet sea.", query: "golden sunrise sea" },
      { word: "they", sentence: "They are playing together happily in the school playground.", query: "happy children playground" }
    ]
  },
  {
    name: "VB 22",
    coverQuery: "bengal tiger wild",
    words: [
      { word: "this", sentence: "This is my favorite English storybook in the library.", query: "open children storybook" },
      { word: "three", sentence: "There are three brown kittens sleeping in the basket.", query: "three cute kittens" },
      { word: "tiger", sentence: "The fierce striped tiger walks quietly through the jungle.", query: "Bengal tiger portrait" },
      { word: "time", sentence: "What time does our afternoon class start today?", query: "pocket watch time" },
      { word: "train", sentence: "The fast train moves quickly along the railway tracks.", query: "modern passenger train tracks" },
      { word: "truck", sentence: "The large red truck carries heavy boxes across town.", query: "large red cargo truck" },
      { word: "TV", sentence: "We watched a funny nature show on TV together.", query: "modern living room television" }
    ]
  },
  {
    name: "VB 23",
    coverQuery: "colorful umbrella rain",
    words: [
      { word: "twelve", sentence: "There are twelve months in one whole calendar year.", query: "calendar twelve months" },
      { word: "two", sentence: "I have two friendly pet dogs at my home.", query: "pair of cute puppies" },
      { word: "umbrella", sentence: "Open your colorful umbrella when the cold rain falls.", query: "bright yellow rain umbrella" },
      { word: "under", sentence: "The sleepy cat is resting under the dining table.", query: "cat under blanket" },
      { word: "wall", sentence: "Hang the beautiful family picture on the bedroom wall.", query: "brick wall texture" },
      { word: "want", sentence: "I want to learn how to swim this summer.", query: "child swimming pool happy" },
      { word: "watch", sentence: "He wears a silver watch on his left wrist.", query: "wristwatch dial time" }
    ]
  },
  {
    name: "VB 24",
    coverQuery: "bright open window sunlight",
    words: [
      { word: "we", sentence: "We work together as a great team in class.", query: "teamwork high five friends" },
      { word: "welcome", sentence: "Welcome to our wonderful English classroom and have fun.", query: "welcome mat door" },
      { word: "what", sentence: "What is your favorite animal in the big zoo?", query: "curious child asking question" },
      { word: "where", sentence: "Where did you put your blue pencil case today?", query: "world map magnifying glass" },
      { word: "white", sentence: "Soft white snow fell quietly from the winter sky.", query: "white winter snow landscape" },
      { word: "window", sentence: "Open the bedroom window to let fresh cool air in.", query: "open window fresh breeze" },
      { word: "woman", sentence: "The kind woman smiled and waved at the children.", query: "smiling friendly woman" }
    ]
  },
  {
    name: "VB 25",
    coverQuery: "sunny zoo animals",
    words: [
      { word: "yellow", sentence: "The bright yellow sunflower turns toward the warm sun.", query: "blooming yellow sunflower" },
      { word: "yes", sentence: "She answered yes when the teacher asked a question.", query: "green checkmark symbol" },
      { word: "you", sentence: "You are a wonderful friend and a great student.", query: "pointing friend smiling" },
      { word: "your", sentence: "Please remember to write your name on your paper.", query: "writing notebook desk" },
      { word: "young", sentence: "The young bird learned how to fly from tree.", query: "young baby bird nest" },
      { word: "zero", sentence: "The temperature dropped to zero degrees on winter night.", query: "number zero digit" },
      { word: "zoo", sentence: "We saw tall giraffes and monkeys at the zoo.", query: "zoo giraffes outdoors" }
    ]
  }
];

async function run() {
  const token = await login();

  console.log(`\n========================================`);
  console.log(`Starting creation of ${LISTS.length} vocabulary lists (VB 6 - VB 25)...`);
  console.log(`School: ${SCHOOL} | Class: ${CLASS_NAME} | Teacher: ${TEACHER_NAME}`);
  console.log(`========================================\n`);

  for (let i = 0; i < LISTS.length; i++) {
    const listDef = LISTS[i];
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const listId = `vocab-list-${timestamp}-${randomSuffix}`;

    console.log(`\n[${i + 1}/${LISTS.length}] Processing ${listDef.name} (${listDef.words.length} words)...`);

    // 1. Fetch cover image
    const coverUrl = await fetchImageForWord(listDef.name, listDef.coverQuery);

    // 2. Insert vocab_list record
    const listRecord = {
      type: "vocab_list",
      owner: TEACHER_NAME,
      teacher_name: TEACHER_NAME,
      school_name: SCHOOL,
      class_name: CLASS_NAME,
      vocab_list_name: listDef.name,
      vocab_list_class: CLASS_NAME,
      vocab_list_school: SCHOOL,
      vocab_list_id: listId,
      vocab_cover_image_url: coverUrl || "",
      vocab_cover_image_id: "",
      archived: false,
      coins: 0,
      pokemon_id: 0,
      pokemon_name: "",
      pokemon_power: 0,
      pokemon_price: 0,
      pokemon_rarity: "",
      shop_pokemon_id: 0,
      shop_pokemon_name: "",
      shop_pokemon_power: 0,
      shop_pokemon_price: 0,
      shop_pokemon_rarity: "",
      shop_pokemon_hp: 0,
      avatar_pokemon_id: 0,
      teacher_credits: 0,
      teacher_pin: "",
      teacher_role: "",
      student_name: "",
      log_action: "",
      log_amount: 0,
      log_target: "",
      quiz_question: "",
      quiz_answer: "",
      quiz_options: "",
      quiz_reward: 0,
      quiz_solved_by: "",
      quiz_type: "",
      quiz_image: "",
      quiz_folder: "",
      folder_name: "",
      quiz_attempts: "",
      quiz_created_by: TEACHER_NAME,
      quiz_class: CLASS_NAME,
      quiz_submitted_answers: "",
      vocab_word: "",
      vocab_image: ""
    };

    const backendListId = await insertRecord(token, listRecord);
    console.log(`  ✓ Created list "${listDef.name}" (ID: ${listId}, Backend: ${backendListId})`);

    // 3. Process words
    for (const w of listDef.words) {
      const wordImg = await fetchImageForWord(w.word, w.query);
      const wordId = `vocab-word-${listId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const wordRecord = {
        type: "vocab_word",
        owner: TEACHER_NAME,
        teacher_name: TEACHER_NAME,
        school_name: SCHOOL,
        class_name: CLASS_NAME,
        vocab_list_name: listDef.name,
        vocab_list_class: CLASS_NAME,
        vocab_list_school: SCHOOL,
        vocab_list_id: listId,
        list_id: listId,
        vocabulary_list_id: listId,
        vocab_word: w.word,
        vocab_sentence: w.sentence,
        vocab_image: wordImg || "",
        word_id: wordId,
        vocab_word_id: wordId
      };

      await insertRecord(token, wordRecord);
      console.log(`    - Added "${w.word}": ${wordImg ? '✓ image attached' : '✗ no image'} | "${w.sentence}"`);
      // Brief pause to be respectful to APIs
      await new Promise(r => setTimeout(r, 120));
    }
  }

  console.log(`\n========================================`);
  console.log(`All ${LISTS.length} vocabulary lists created successfully!`);
  console.log(`========================================\n`);
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
