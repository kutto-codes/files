const calculateBtn = document.getElementById('calculateBtn');
const resultBox = document.getElementById('result');

const TOTAL_MODULES = 40;
const AVG_HOURS_PER_MODULE = 3; // rough estimate used for the "weeks remaining" projection

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTier(readiness) {
  if (readiness >= 80) return { label: 'Advanced', css: 'tier-advanced' };
  if (readiness >= 50) return { label: 'Intermediate', css: 'tier-intermediate' };
  return { label: 'Beginner', css: 'tier-beginner' };
}

function calculateReadiness() {
  const modulesCompleted = Number(document.getElementById('modulesCompleted').value);
  const quizScore = Number(document.getElementById('quizScore').value);
  const labsCompleted = Number(document.getElementById('labsCompleted').value);
  const hoursPerWeek = Number(document.getElementById('hoursPerWeek').value);

  const validInputs =
    modulesCompleted >= 0 &&
    quizScore >= 0 && quizScore <= 100 &&
    labsCompleted >= 0 &&
    hoursPerWeek > 0;

  if (!validInputs) {
    resultBox.innerHTML = '<p><strong>Please enter valid values — modules ≥ 0, quiz score 0–100, labs ≥ 0, and study hours greater than 0.</strong></p>';
    return;
  }

  const moduleProgress = clamp(modulesCompleted, 0, TOTAL_MODULES) / TOTAL_MODULES; // 0–1
  const quizComponent = quizScore / 100; // 0–1
  const labComponent = clamp(labsCompleted, 0, 20) / 20; // caps out at 20 labs

  // Weighted blend: finishing modules matters most, then quiz mastery, then practice reps.
  const readiness = clamp(
    moduleProgress * 50 + quizComponent * 30 + labComponent * 20,
    0,
    100
  );

  const remainingModules = Math.max(TOTAL_MODULES - modulesCompleted, 0);
  const remainingHours = remainingModules * AVG_HOURS_PER_MODULE;
  const weeksRemaining = remainingModules === 0 ? 0 : Math.ceil(remainingHours / hoursPerWeek);

  const tier = getTier(readiness);

  resultBox.innerHTML = `
    <span class="result-tier ${tier.css}">${tier.label}</span>
    <p><strong>Readiness score:</strong> ${readiness.toFixed(0)}%</p>
    <p><strong>Modules remaining:</strong> ${remainingModules} of ${TOTAL_MODULES}</p>
    <p><strong>Estimated time to finish:</strong> ${
      weeksRemaining === 0 ? 'All modules complete' : `~${weeksRemaining} week${weeksRemaining === 1 ? '' : 's'} at ${hoursPerWeek}h/week`
    }</p>
    <p><strong>Suggested focus:</strong> ${
      quizComponent < moduleProgress
        ? 'Your quiz scores are lagging your module pace — slow down and revisit weak topics before moving on.'
        : labComponent < 0.5
        ? 'Add more hands-on labs or CTF practice — concepts stick better once you\u2019ve applied them.'
        : 'Good balance — keep the current pace and start looking at practice assessments for your next track.'
    }</p>
  `;
}

calculateBtn.addEventListener('click', calculateReadiness);
window.addEventListener('load', calculateReadiness);
