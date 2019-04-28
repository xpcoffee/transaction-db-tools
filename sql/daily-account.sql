SELECT 
    (bank || " " || account) as account,
    min(balance) AS balance, 
    sum(amount) AS delta,
    strftime('%Y-%m-%d', timestamp) AS day
FROM transactions 
GROUP BY account, day
ORDER BY account, day;