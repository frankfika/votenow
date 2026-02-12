const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/fangchen/.claude/skills/pptx/scripts/html2pptx');
const path = require('path');

async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'VoteNow';
    pptx.title = 'VoteNow - AI-Powered Governance Layer';

    const slidesDir = '/Users/fangchen/Baidu/GitHub/openclaw-delegate/ppt_slides';

    // Slide 1: Title
    console.log('Creating slide 1: Title...');
    await html2pptx(path.join(slidesDir, 'slide01_title.html'), pptx);

    // Slide 2: Problem
    console.log('Creating slide 2: Problem...');
    await html2pptx(path.join(slidesDir, 'slide02_problem.html'), pptx);

    // Slide 3: Solution
    console.log('Creating slide 3: Solution...');
    await html2pptx(path.join(slidesDir, 'slide03_solution.html'), pptx);

    // Slide 4: Tech Architecture
    console.log('Creating slide 4: Tech Architecture...');
    await html2pptx(path.join(slidesDir, 'slide04_tech_arch.html'), pptx);

    // Slide 5: AI Architecture
    console.log('Creating slide 5: AI Architecture...');
    await html2pptx(path.join(slidesDir, 'slide05_ai_arch.html'), pptx);

    // Slide 6: AI Features
    console.log('Creating slide 6: AI Features...');
    await html2pptx(path.join(slidesDir, 'slide06_ai_features.html'), pptx);

    // Slide 7: Voting Flow
    console.log('Creating slide 7: Voting Flow...');
    await html2pptx(path.join(slidesDir, 'slide07_voting_flow.html'), pptx);

    // Slide 8: Data Flow
    console.log('Creating slide 8: Data Flow...');
    await html2pptx(path.join(slidesDir, 'slide08_data_flow.html'), pptx);

    // Slide 9: AI Flywheel
    console.log('Creating slide 9: AI Flywheel...');
    await html2pptx(path.join(slidesDir, 'slide09_ai_flywheel.html'), pptx);

    // Slide 10: Security
    console.log('Creating slide 10: Security...');
    await html2pptx(path.join(slidesDir, 'slide10_security.html'), pptx);

    // Slide 11: Future
    console.log('Creating slide 11: Future...');
    await html2pptx(path.join(slidesDir, 'slide11_future.html'), pptx);

    // Slide 12: Ask
    console.log('Creating slide 12: Ask...');
    await html2pptx(path.join(slidesDir, 'slide12_ask.html'), pptx);

    // Save
    const outputPath = '/Users/fangchen/Baidu/GitHub/openclaw-delegate/VoteNow_Technical_Deck.pptx';
    await pptx.writeFile({ fileName: outputPath });
    console.log(`Presentation saved to: ${outputPath}`);
}

createPresentation().catch(err => {
    console.error('Error creating presentation:', err);
    process.exit(1);
});
