/* Conviction additions v1: two values and ten user-selected world beliefs.
   Belief wording is an original character-friendly adaptation, not questionnaire text.
   Families, connections, cues, and scenes are editorial suggestions for improvisers. */
(() => {
  'use strict';
  const content = window.referenceContent;

  // These families give the broader assumptions about reality a clear home in the index.
  content.families.push(
    {id:'opportunity', name:'Opportunity & abundance', type:'belief', question:'How much possibility does life offer?', color:'#BD005B'},
    {id:'patterns', name:'Patterns & connections', type:'belief', question:'How does the world fit together?', color:'#BD005B'}
  );

  // Keep each conviction beside its three independent scenes for straightforward editing.
  const additions = [
    {
      id:'v31', type:'value', family:'duty', kind:'Value', name:'Respect for authority',
      meaning:'Valuing established roles, leadership, and legitimate hierarchy. Respect can attach to someone’s role even when the character dislikes a particular decision or rule.',
      cue:'Choose whose authority your character recognizes and why. Let disagreement coexist with a choice to defer, consult, or follow their lead.',
      relatedIds:['b13','v16','v23','physicality-5'],
      scenes:[
        ['On a research ship, your fellow scientist wants to overrule the captain’s decision to return to port.', 'I wanted another day out here too. She’s the captain; we follow her decision.'],
        ['At a school concert rehearsal, an experienced parent tries to change the student conductor’s tempo.', 'She has the baton. Let her finish telling us how she wants this played.'],
        ['In a restaurant kitchen, your colleague asks you to bypass the newly appointed head chef and approve a menu change.', 'I trained him, but it’s his kitchen now. Bring him the idea and let him decide.']
      ]
    },
    {
      id:'v32', type:'value', family:'tradition', kind:'Value', name:'Sacredness / purity',
      meaning:'Protecting something considered inviolable from desecration, contamination, or being treated as an ordinary commodity. What matters is its protected status, not simply its age or a belief in spiritual guidance.',
      cue:'Decide what your character holds sacred and what would cross a boundary. It can be a place, object, promise, or practice with personal or shared significance.',
      relatedIds:['v18','v19','b28','physicality-7'],
      scenes:[
        ['At a neighborhood planning meeting, a developer proposes putting a vending machine inside the community memorial.', 'You cannot turn our memorial into a vending machine. Put it by the car park.'],
        ['In a family kitchen, your cousin wants to use the bowl reserved for a remembrance ceremony to mix party snacks.', 'Use any other bowl. That one holds the names we read each year.'],
        ['At a mountain campsite, your business partner suggests selling naming rights to the spring your group has sworn to protect.', 'We promised to keep this spring beyond anyone’s ownership. That includes a sponsor’s name.']
      ]
    },
    {
      id:'b31', type:'belief', family:'opportunity', kind:'Worldview', name:'Life offers more possibilities than we can use.',
      meaning:'An assumption that worthwhile opportunities are plentiful, so missing one possibility does not close off a meaningful future.',
      cue:'Let abundance shape a concrete choice: share an opening, release a missed chance, or explore another route. Your partner can reveal what this outlook costs or makes possible.',
      relatedNames:['Adventure','Variety','Freedom'], relatedIds:['b32','emotion-9','want-2'],
      scenes:[
        ['At a market stall, your sibling worries that another baker has taken the last available pitch on the main street.', 'There are weddings, night markets, and that café with no kitchen. We have more places to try than cakes to bake.'],
        ['In a university corridor, your friend considers hiding an internship notice so fewer people will apply.', 'Put it back on the board. This isn’t the only door either of us will ever get.'],
        ['At a travel desk, your partner learns that your first-choice island ferry is sold out.', 'Look at that map. We could spend our whole lives choosing harbors and still miss most of them.']
      ]
    },
    {
      id:'b32', type:'belief', family:'opportunity', kind:'Worldview', name:'Good opportunities are rare; you have to secure yours.',
      meaning:'An assumption that worthwhile openings are scarce and easily lost, making early commitment or protecting one’s access feel necessary.',
      cue:'Choose the opportunity your character fears losing. Show what they do to secure it, while allowing your partner to question whether it is really the last chance.',
      relatedNames:['Safety','Ambition','Wealth'], relatedIds:['b31','emotion-2','want-7'],
      scenes:[
        ['At an apartment viewing, your roommate wants to sleep on the decision before applying.', 'There are six people measuring the windows. I’m filling out the form before we leave.'],
        ['Backstage at a music venue, your bandmate suggests declining an unexpected opening slot until you feel more ready.', 'They don’t ask unknown bands twice. Tell them we can set up in ten minutes.'],
        ['In a pottery studio, your partner wants to release your reserved kiln slot because you only have a few pieces ready.', 'Keep the booking. Last time we gave it up, we waited four months to fire anything.']
      ]
    },
    {
      id:'b33', type:'belief', family:'patterns', kind:'Worldview', name:'Even confusing events have explanations we can discover.',
      meaning:'An assumption that apparent disorder is understandable with enough observation, questions, or investigation.',
      cue:'Choose a puzzling detail and pursue an explanation with your partner. Let new evidence change your theory rather than making your character automatically correct.',
      relatedNames:['Curiosity','Mastery'], relatedIds:['b8','emotion-32','behavior-5'],
      scenes:[
        ['In an apartment laundry room, your neighbor insists that the washing machine only works when somebody sings.', 'Before we start a choir, show me what you touch when you lean in for the chorus.'],
        ['At a train station, your colleague notices every arrival board displaying a different time for the same service.', 'Somewhere those boards get their information. Let’s find out which one updated last.'],
        ['In a greenhouse, your apprentice calls one flourishing plant a miracle because everything around it has wilted.', 'What reaches this pot that doesn’t reach the others? Let’s start with the light.']
      ]
    },
    {
      id:'b34', type:'belief', family:'agency', kind:'Worldview', name:'The world is gradually getting better.',
      meaning:'An assumption that, despite setbacks and uneven change, life is moving toward better conditions over time.',
      cue:'Choose a sign of improvement your character trusts. Let that larger outlook affect their response to a present setback without erasing what their partner is experiencing.',
      relatedNames:['Inclusion','Justice','Sustainability'], relatedIds:['b35','b6','emotion-9'],
      scenes:[
        ['Outside a town hall, your colleague is discouraged when a new accessibility proposal is delayed.', 'Ten years ago they wouldn’t even put us on the agenda. I think we’ll get the ramp, and I’m coming back with you.'],
        ['At a family dinner, your uncle says one ugly news story proves that nothing ever improves.', 'That story is awful. I still think your grandchildren are growing up with more choices than we had.'],
        ['In a river-cleanup shed, your teammate wants to quit after another afternoon collecting rubbish.', 'I remember when nothing nested on that bank. We found three nests today. This is moving somewhere.']
      ]
    },
    {
      id:'b35', type:'belief', family:'agency', kind:'Worldview', name:'The things that make life good are disappearing.',
      meaning:'An assumption that valued qualities of life are being lost over time, making preservation or resistance to change feel urgent.',
      cue:'Decide what your character sees slipping away. Let them notice losses selectively, while leaving room for your partner to offer a different view of the same change.',
      relatedNames:['Tradition','Community','Stability'], relatedIds:['b34','b28','emotion-45'],
      scenes:[
        ['At a corner shop, the owner shows you the automated kiosk replacing the staffed counter.', 'First the benches, now the person who knows our names. Soon there won’t be anywhere left to be a regular.'],
        ['In a family attic, your daughter suggests discarding the handwritten letters after scanning them.', 'Every year we trade another thing we can hold for something on a screen. Leave me the handwriting.'],
        ['At a music school, your colleague announces that the last group rehearsal will become individual online lessons.', 'One more room where people used to listen to each other, gone. I don’t think we know what we’re losing.']
      ]
    },
    {
      id:'b36', type:'belief', family:'patterns', kind:'Worldview', name:'Changing one thing affects more than we can see.',
      meaning:'An assumption that events and systems are interconnected, so a local decision can have consequences beyond its obvious target.',
      cue:'Follow one consequence of an ordinary choice. Invite your partner to consider another connection instead of claiming to predict every outcome.',
      relatedNames:['Sustainability','Community','Compassion'], relatedIds:['b30','b21','want-8'],
      scenes:[
        ['At a café staff meeting, your co-owner suggests closing one hour earlier to reduce costs.', 'Before we change it, ask who waits here for the last bus. This hour is doing more than selling coffee.'],
        ['In an orchard, your neighbor proposes removing the untidy hedge between your properties.', 'The birds nest there, and they eat what damages the fruit. We’re moving more than a boundary.'],
        ['At a theater, the producer wants to move opening night without consulting the other volunteers.', 'The costume crew shares childcare with the lighting crew. Pull that date and we need to see what else comes with it.']
      ]
    },
    {
      id:'b37', type:'belief', family:'meaning', kind:'Worldview', name:'The world needs something I can contribute.',
      meaning:'An assumption that one’s particular abilities, perspective, or care have a needed place in the larger world.',
      cue:'Choose a specific contribution your character believes matters. Let them offer it and listen to how the other person actually needs it.',
      relatedNames:['Selflessness','Mastery','Recognition'], relatedIds:['b27','emotion-5','want-8'],
      scenes:[
        ['At a relief center, the coordinator asks a retired radio operator what they can do with the donated equipment.', 'I can get these sets talking to each other. There’s still a reason I learned all those frequencies.'],
        ['In a school office, a teacher worries that a newly arrived family cannot read any of the welcome materials.', 'I speak their language. Give me the folder; this is something I can make easier.'],
        ['At a neighborhood meeting, your friend says your knowledge of old footpaths is too obscure to be useful.', 'They need a route to the clinic that avoids the main road. I know one. This is my bit.']
      ]
    },
    {
      id:'b38', type:'belief', family:'agency', kind:'Worldview', name:'Some situations are better accepted than improved.',
      meaning:'An assumption that trying to optimize or control every circumstance can cost more than living with what is already there.',
      cue:'Choose something your character is willing to leave as it is. Make acceptance an active choice that can coexist with care, rather than simply disengaging from the scene.',
      relatedNames:['Enjoyment','Deep relationships','Stability'], relatedIds:['b9','emotion-10','physicality-3'],
      scenes:[
        ['At a rainy picnic, your partner starts planning a complicated move to three separate cars.', 'The food is dry under this tree. Let’s hear the rain and have lunch where we are.'],
        ['In a family kitchen, your brother wants to redesign your grandmother’s uneven handwritten recipe book.', 'We can read it. I like that the cake page still has her corrections.'],
        ['At a dance class, your spouse apologizes for never quite mastering the turn and proposes extra drills at home.', 'We came here to dance together. I don’t need us to turn perfectly to enjoy this.']
      ]
    },
    {
      id:'b39', type:'belief', family:'meaning', kind:'Worldview', name:'Ordinary places contain things worth admiring.',
      meaning:'An assumption that beauty and interest are present in everyday surroundings, rather than confined to exceptional places or experiences.',
      cue:'Notice a precise detail in the shared environment and invite your partner to see it. Let that attention change how you spend an ordinary moment.',
      relatedNames:['Curiosity','Enjoyment','Creativity'], relatedIds:['emotion-34','voice-2'],
      scenes:[
        ['In a supermarket car park, your friend hurries you toward the car as sunset reflects in a puddle.', 'Wait a second. The whole sky fits between those two painted lines.'],
        ['At a laundromat, your roommate complains that you have wasted the morning watching machines.', 'Look how the red scarf keeps finding the window. We’ve accidentally bought tickets to a tiny ballet.'],
        ['In an office stairwell, a coworker asks why you have stopped on a landing you use every day.', 'At this hour the handrail throws a perfect spiral. Has it been doing that all along?']
      ]
    },
    {
      id:'b40', type:'belief', family:'meaning', kind:'Worldview', name:'Even serious situations have an absurd side.',
      meaning:'An assumption that incongruity and humor can exist alongside real stakes, allowing a person to notice absurdity without denying that something matters.',
      cue:'Find the mismatch inside a serious situation. Share the observation in a way that lets your partner decide whether humor connects you in this moment.',
      relatedNames:['Enjoyment','Creativity','Deep relationships'], relatedIds:['b29','emotion-25','voice-6'],
      scenes:[
        ['Outside an important licensing hearing, your colleague discovers that the official waiting-room clock is drawn on the wall.', 'We can lose our license for inaccurate records, but apparently time here is an illustration.'],
        ['At a wedding rehearsal, your fiancé becomes overwhelmed as two relatives argue over who should lead the procession.', 'We’ve chosen to spend our lives together, and the unsolved part is who walks past a fern first.'],
        ['In an emergency budget meeting, your co-owner brings out a large decorative calculator that cannot add.', 'We bought a calculator for appearances. I think we’ve found a small clue about the budget.']
      ]
    }
  ];

  // Extend the original library without renumbering any existing entry or scene link.
  for (const {scenes, ...entry} of additions) {
    content.entries.push(entry);
    const family = content.families.find(item => item.id === entry.family && item.type === entry.type);
    if (family.names) family.names.push(entry.name);
    window.characterScenePrompts[entry.id] = scenes.map(([setup,line]) => ({setup,line}));
  }
})();
