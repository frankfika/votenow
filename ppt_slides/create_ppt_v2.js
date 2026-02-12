const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/fangchen/.claude/skills/pptx/scripts/html2pptx');
const path = require('path');

async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'VoteNow';
    pptx.title = 'VoteNow - AI-Powered Governance Layer';

    const slidesDir = '/Users/fangchen/Baidu/GitHub/openclaw-delegate/ppt_slides';

    // Slide 1: Title / Vision
    console.log('Creating slide 1: Title...');
    await html2pptx(path.join(slidesDir, 'slide01_title.html'), pptx);

    // Slide 2: Problem
    console.log('Creating slide 2: Problem...');
    await html2pptx(path.join(slidesDir, 'slide02_problem.html'), pptx);

    // Slide 3: Solution
    console.log('Creating slide 3: Solution...');
    await html2pptx(path.join(slidesDir, 'slide03_solution.html'), pptx);

    // Slide 4: Market (NEW)
    console.log('Creating slide 4: Market...');
    await html2pptx(path.join(slidesDir, 'slide04_market.html'), pptx);

    // Slide 5: Tech & AI Stack (MERGED)
    console.log('Creating slide 5: Tech & AI Stack...');
    await html2pptx(path.join(slidesDir, 'slide05_tech_ai_stack.html'), pptx);

    // Slide 6: AI Deep Dive
    console.log('Creating slide 6: AI Deep Dive...');
    await html2pptx(path.join(slidesDir, 'slide06_ai_features.html'), pptx);

    // Slide 7: AI Flywheel
    console.log('Creating slide 7: AI Flywheel...');
    await html2pptx(path.join(slidesDir, 'slide07_ai_flywheel.html'), pptx);

    // Slide 8: Governance 101 (MOVED UP)
    console.log('Creating slide 8: Governance 101...');
    await html2pptx(path.join(slidesDir, 'slide08_governance_types.html'), pptx);

    // Slide 9: User Flow
    console.log('Creating slide 9: User Flow...');
    await html2pptx(path.join(slidesDir, 'slide09_voting_flow.html'), pptx);

    // Slide 10: Data & Security
    console.log('Creating slide 10: Data & Security...');
    await html2pptx(path.join(slidesDir, 'slide10_data_security.html'), pptx);

    // Slide 11: Competition (NEW)
    console.log('Creating slide 11: Competition...');
    await html2pptx(path.join(slidesDir, 'slide11_competition.html'), pptx);

    // Slide 12: Business Model & Roadmap (NEW)
    console.log('Creating slide 12: Business Model & Roadmap...');
    await html2pptx(path.join(slidesDir, 'slide12_business_roadmap.html'), pptx);

    // Slide 13: The Ask
    console.log('Creating slide 13: The Ask...');
    await html2pptx(path.join(slidesDir, 'slide13_ask.html'), pptx);

    // Save
    const outputPath = '/Users/fangchen/Baidu/GitHub/openclaw-delegate/VoteNow_Pitch_Deck_Final.pptx';
    await pptx.writeFile({ fileName: outputPath });
    console.log(`Presentation saved to: ${outputPath}`);
}

createPresentation().catch(err => {
    console.error('Error creating presentation:', err);
    process.exit(1);
});
