# OpenAI API Setup Guide

This guide helps you resolve OpenAI API quota and billing issues.

## Quick Fix for "Quota Exceeded" Error

The error "You exceeded your current quota" means your OpenAI API usage has hit billing limits.

### Immediate Solutions:

1. **Check Your Usage**: https://platform.openai.com/usage
   - View your current usage and limits
   - See how much you've spent this month

2. **Add Payment Method**: https://platform.openai.com/account/billing
   - Add a credit card to increase limits
   - Set usage limits to control spending

3. **Upgrade Your Plan**:
   - Free tier: $5/month limit
   - Pay-as-you-go: Higher limits with billing

4. **Wait for Reset** (Free Tier Only):
   - Quotas reset monthly
   - Check when your next reset occurs

## Environment Setup

### 1. Get Your API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### 2. Set Environment Variable
Create a `.env.local` file in your project root:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

**Never commit this file to version control!**

### 3. Verify Setup
The application will show configuration errors if the API key is missing.

## Cost Management

### Typical Usage:
- Each complaint generation: ~$0.01-0.03
- 100 complaints: ~$1-3
- Caching reduces repeat costs

### Set Spending Limits:
1. Go to https://platform.openai.com/account/billing/limits
2. Set monthly budget (e.g., $10)
3. Enable usage alerts

## Troubleshooting

### "Invalid API Key"
- Check your `.env.local` file
- Ensure key starts with `sk-`
- Verify key is active at https://platform.openai.com/api-keys

### "Rate Limit Exceeded"
- Wait 60 seconds between requests
- Different from quota errors
- Temporary throttling, not billing issue

### "Quota Exceeded"
- Check billing at https://platform.openai.com/account/billing
- Add payment method or wait for reset
- Use manual template as fallback

## Manual Complaint Template

If API is unavailable, use this template:

```
[ATTORNEY NAME] (California State Bar No. [NUMBER])
[EMAIL]
[LAW FIRM NAME]
[ADDRESS]
[CITY, STATE ZIP]
Telephone: [PHONE]

Attorney for [PARTY]

SUPERIOR COURT OF CALIFORNIA
COUNTY OF [COUNTY NAME]

[PLAINTIFF NAME],
    Plaintiff,
v.
[DEFENDANT NAME],
    Defendant.

No. [CASE NUMBER]

COMPLAINT

PARTIES

I. Jurisdiction

1. This Court has jurisdiction over this action because [jurisdiction basis].

2. Venue is proper in this County because [venue basis].

FIRST CAUSE OF ACTION
(Negligence)

3. [State your factual allegations here]

4. Defendant owed Plaintiff a duty of care.

5. Defendant breached that duty by [specific actions].

6. As a proximate result, Plaintiff suffered damages.

PRAYER FOR RELIEF

WHEREFORE, Plaintiff prays for:
1. General damages according to proof;
2. Special damages according to proof;
3. Costs of suit;
4. Such other relief as the Court deems just and proper.

JURY DEMAND

Plaintiff demands trial by jury.

Dated: [DATE]

                    [ATTORNEY SIGNATURE]
                    [ATTORNEY NAME]
                    Attorney for Plaintiff
```

## Support

- OpenAI Documentation: https://platform.openai.com/docs/guides/error-codes/api-errors
- OpenAI Help: https://help.openai.com/
- Community: https://community.openai.com/
