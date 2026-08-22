A query parameter (also called a query string or URL parameter) is a key-value pair appended to the end of a URL to pass extra information to a web server. They are primarily used to filter, sort, or paginate data without altering the main endpoint of the website or API

Structure of Query Parameters

Query parameters follow a strict syntax structure within a URL:

The Question Mark (?): Separates the main URL path from the query parameters.

The Key-Value Pair: Written as key=value. The key is the name of the data field, and the value is the actual data.

The Ampersand (&): Used to separate and chain multiple parameters together.

Common Use Cases

Searching & Filtering: Telling the server exactly what content to look for (e.g., Google search tracking your keyword via ?q=query+parameter).

Pagination: Breaking down a massive list of items into smaller, digestible pages (e.g., ?limit=10&page=3).

Sorting: Changing the order of the displayed data (e.g., ?order=newest).

Marketing Analytics: Tracking where web traffic is coming from using standardized UTM parameters (e.g., ?utm_source=newsletter).

Important Rules to Remember

URL Encoding: URLs cannot contain spaces or certain special characters. The browser automatically converts them into percent-encoded values (e.g., a space becomes %20).

Case Sensitivity: Parameter keys are strictly case-sensitive; ?search=web and ?Search=web are treated as different instructions by most servers.

Data Type: All parameters are inherently transmitted as text strings. Backend code must manually convert numbers or booleans into their correct data types.