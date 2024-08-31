# OpenChargeMap POI Integration Microservice #

## Project Overview ##
### Introduction ###
This project aims to enhance our existing platform by integrating Points of Interest (POIs) from OpenChargeMap through a dedicated microservice. These POIs will serve as core data for the platform, providing users with valuable information about charging stations for electric vehicles

### Goals ###
* **Robust and Resilient Integration**: Ensure the integration is robust and resilient, capable of handling various edge cases and maintaining high availability.
* **High Monitoring and Accuracy**: Implement comprehensive monitoring to ensure the accuracy and reliability of the data. This includes real-time alerts and regular audits.
* **Seamless Interaction**: Ensure the microservice interacts seamlessly with the remaining services of the platform, maintaining data consistency and integrity.
* **Scalability**: Design the microservice to be scalable, accommodating future growth in data volume and user base.

### Significance ###
The integration of POIs from OpenChargeMap is crucial for our platform as it enhances the user experience by providing accurate and up-to-date information about charging stations. This integration supports our mission to promote sustainable transportation by making it easier for users to find and utilize electric vehicle charging infrastructure. Additionally, the robust and resilient implementation ensures that our platform remains reliable and trustworthy, further solidifying our position as a leader in the industry.

## Architecture Diagram ##
<img width="569" alt="Architecture Diagram" src="https://github.com/user-attachments/assets/e2d6a7fa-609a-4140-86b9-2f7b23479886">

### Components and Interactions ###
* **OpenChargeMap API**:
    * Provides Points of Interest (POIs) data for electric vehicle charging stations.
    * The Express (Node.js) server fetches data from this API.

* **Express Server (Nodejs + Typescript)**:
    * Acts as the core backend server.
    * Fetches data from the OpenChargeMap API.
    * Interacts with the MongoDB database and Redis Cache to store and retrieve data.
    * Uses TypeScript for type safety and better code management.

* **MongoDB Database**:
    * Stores the POIs data fetched from the OpenChargeMap API.
    * Ensures data persistence and allows for efficient querying.

* **Apollo GraphQL Server**:
    * Provides a GraphQL interface for querying the POIs data.
    * Interacts with the Node.js server to fetch and manipulate data.
    * Ensures seamless interaction with other services of the platform.
    * Periodically triggers data import tasks.

* **Redis Cache**:
    * Caches frequently accessed data to reduce the load on the OpenChargeMap API and MongoDB.
    * Enhances the performance and efficiency of the system.

### Data Flow ###

* **Data Fetching**:
    * The Node.js server fetches POIs data from the OpenChargeMap API.
    * The fetched data is stored in the MongoDB database for persistence.

* **Data Caching**:
    * Frequently accessed data is cached in Redis to improve performance.
    * The Node.js server checks the Redis cache before querying the MongoDB database or the OpenChargeMap API.

* **Data Querying**:
    * The Apollo GraphQL server provides a GraphQL interface for querying the POIs data.
    * Queries are handled by the Node.js server, which interacts with Redis and MongoDB to fetch the required data.

## Installation and Usage ##
* **Clone the repository**:<br/>
  ` git clone https://github.com/kiranshendge/OpenChargeMapImporter.git `

* **Install dependencies**:<br/>
  `npm install`

* **Set up environment variables**:<br/>
Create a .env file in the root directory and add the necessary environment variables.

* **Build the project**:
  ` npm run build `

* **Run the application**:
  ` docker compose up `

### Usage ###
We have implemented two approaches to Import POIs data to database
1. We have implemented scheduler which runs daily at 12 am.
2. We have added mutation to import data. Please access the apollo GraphQL Playground at http://localhost:4000.

## API Documentation ##
### Endpoints ###
1. **Import data**
   * **Endpoint**: /importChargingStations
   * **Description**: Fetches Points of Interest (POIs) from the OpenChargeMap API and stores them in MongoDB.
   * **Request Format**:
      ```javascript
      mutation {
         importChargingStations: response!
      }
      ```
   * **Response Format**:
      * **Successful Response**:
         ```json
         {
           "data": {
             "importChargingStations": {
               "body": {
                 "message": "success",
                 "data": "Import completed"
               },
               "statusCode": 200
             }
           }
         }
         ```
      * **Error Response**: If incorrect API key is provided
        ```json
        {
           "errors": [
            {
               "message": "Invalid API key",
               "extensions": {}
             }
           ],
           "data": null
         }
        ```
### Authentication Mechanisms ###
* **API Key Authentication**:
   * **Description**: Use an API key to authenticate requests to the OpenChargeMap API.
   * **Implementation**:
        * Obtain an API key from OpenChargeMap.
        * Include the API key in the request headers or request parameters

## Database Documentation ##
* **Collections and Schema**
     1. **ChargingStations Collection**
        ```javascript
        const ChargingStationSchema = new Schema({
        _id: { type: String, default: uuidv4() },
        isRecentlyVerified: { type: Boolean, required: true},
        dateLastVerified: { type: Date, required: true},
        id: { type: Number, required: true},
        uuid: { type: String, required: true},
        dataProviderId: { type: Number, required: true},
        operatorId: { type: Number, required: true},
        usageTypeId: { type: Number, required: true},
        addressInfo: { type: String, ref: 'Address', required: true},
        connections: [{ type: String, ref: 'Connection', required: true}],
        numberOfPoints: { type: Number, required: true},
        statusTypeId: { type: Number, required: true},
        dateLastStatusUpdate: { type: Date, required: true},
        dataQualityLevel: { type: Number, required: true},
        dateCreated: { type: Date, required: true},
        submissionStatusTypeId: { type: Number, required: true}})
        ```
     2. **AddressInfo Collection**
        ```javascript
        const AddressInfoSchema = new Schema({
        _id: { type: String, default: uuidv4() },
        id: { type: Number, required: true},
        title: { type: String, required: true},
        addressLine1: { type: String, required: true},
        town: { type: String, required: true},
        stateOrProvince: { type: String, required: true},
        postcode: { type: String, required: true},
        countryId: { type: Number, required: true},
        latitude: { type: Number, required: true},
        longitude: { type: Number, required: true},
        distanceUnit: { type: Number, required: true}})
        ```
     3. **Connection Collection**
        ```javascript
        const ConnectionSchema = new Schema({
        _id: { type: String, default: uuidv4() },
        id: { type: Number, required: true},
        connectionTypeId: { type: Number, required: true},
        statusTypeId: { type: Number, required: true},
        levelId: { type: Number, required: true},
        powerKW: { type: Number, required: true},
        quantity: { type: Number, required: true}})
        ```
* **Relationships**
     * **ChargingStations to AddressInfo**: One-to-One
          * Each charging station can have one address.
  
     * **ChargingStations to Connection**: One-to-Many
          * Each charging station can have multiple connections.

* **Indexing Strategies**
  1. **ChargingStations Collection**:
     * Index on <kbd>id</kbd>: To ensure fast lookups by the unique identifier.
       ```json
       { "id": 1}
       ```
     * Index on <kbd>statusTypeId</kbd>: To optimize queries filtering by status.
       ```json
       { "statusTypeId": 1}
       ```
   2. **AddressInfo Collection**:
      * Index on <kbd>Country</kbd> and <kbd>Town</kbd>: To optimize queries filtering by location.
       ```json
       { "countryId": 1, "town": 1}
       ```
   3. **Connection Collection**:
      * Index on <kbd>id</kbd>: To ensure fast lookups by the unique identifier.
       ```json
       { "id": 1}
       ```

## Deployment Instructions ##
### Prerequisites ###
* **Kubernetes Cluster**: Ensure you have a Kubernetes cluster set up. You can use a managed Kubernetes service like Google Kubernetes Engine (GKE), Amazon EKS, or Azure AKS.
* **kubectl**: Install <kbd>kubectl</kbd> and configure it to connect to your Kubernetes cluster.
* **Docker**: Install Docker to build your application images.

### Step 1: Create Docker Images ###
1. **Create Dockerfile for Node.js Application**:
   ```yaml
   # Dockerfile
   FROM node:16
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   
   EXPOSE 4000
   CMD ["node", "dist/index.js"]
   ```
2. **Build and Push Docker Image**:<br />
   `docker build -t your-dockerhub-username/openchargemap-graphql .`<br />
   `docker push your-dockerhub-username/openchargemap-graphql`

### Step 2: Set Up Kubernetes Manifests ###
1. **Create a Namespace**:
   ```yaml
   # namespace.yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: openchargemap
   ```
2. **Create Deployment and Service for Node.js Application**:
   ```yaml
   # deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: openchargemap-graphql
     namespace: openchargemap
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: openchargemap-graphql
     template:
       metadata:
         labels:
           app: openchargemap-graphql
       spec:
         containers:
         - name: openchargemap-graphql
           image: your-dockerhub-username/openchargemap-graphql:latest
           ports:
           - containerPort: 4000
           env:
           - name: REDIS_URL
             value: "redis://redis:6379"
           - name: MONGODB_URL
             value: "mongodb://mongo:27017/openchargemap"
   ```
   ```yaml
   # service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: openchargemap-graphql
     namespace: openchargemap
   spec:
     selector:
       app: openchargemap-graphql
     ports:
       - protocol: TCP
         port: 80
         targetPort: 4000
     type: LoadBalancer
   ```
3. **Create Deployment and Service for Redis**:
   ```yaml
   # redis-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: redis
     namespace: openchargemap
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: redis
     template:
       metadata:
         labels:
           app: redis
       spec:
         containers:
         - name: redis
           image: redis:alpine
           ports:
           - containerPort: 6379
   ```
   ```yaml
   # redis-service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: redis
     namespace: openchargemap
   spec:
     selector:
       app: redis
     ports:
       - protocol: TCP
         port: 6379
         targetPort: 6379
   ```
4. **Create Deployment and Service for MongoDB**:
   ```yaml
   # mongo-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: mongo
     namespace: openchargemap
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: mongo
     template:
       metadata:
         labels:
           app: mongo
       spec:
         containers:
         - name: mongo
           image: mongo:latest
           ports:
           - containerPort: 27017
   ```
   ```yaml
   # mongo-service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: mongo
     namespace: openchargemap
   spec:
     selector:
       app: mongo
     ports:
       - protocol: TCP
         port: 27017
         targetPort: 27017
   ```

### Step 3: Deploy to Kubernetes
1. **Apply Namespace**:<br />
   `kubectl apply -f namespace.yaml`

2. **Apply Redis Deployment and Service**:<br />
   `kubectl apply -f redis-deployment.yaml`<br />
   `kubectl apply -f redis-service.yaml`

3. **Apply MongoDB Deployment and Service**:<br />
   `kubectl apply -f mongo-deployment.yaml`<br />
   `kubectl apply -f mongo-service.yaml`

4. **Apply Node.js Application Deployment and Service**:<br />
   `kubectl apply -f deployment.yaml`<br />
   `kubectl apply -f service.yaml`

### Step 4: Verify Deployment ###
1. **Check Pods**:<br />
   `kubectl get pods -n openchargemap`

2. **Check Services**:<br />
   `kubectl get services -n openchargemap`

3. **Access the Application**:<br />
   * Find the external IP of the openchargemap-graphql service.
   * Access the Apollo GraphQL Playground at <kbd>http://<EXTERNAL_IP></kbd>.

### Step 5: Monitor and Scale ###
1. **Monitor Logs**:<br />
   `kubectl logs -f <pod-name> -n openchargemap`

2. **Scale Deployments**:<br />
   `kubectl scale deployment openchargemap-graphql --replicas=5 -n openchargemap`

## Reliability and Scalability ##
Ensuring high uptime and scalability, while addressing timeouts and fault tolerance, is crucial for the reliability and performance of the OpenChargeMap POI Integration Microservice. Here’s how the project achieves these goals:

### High Uptime ###
1. **Kubernetes Deployment**:
   * **Replica Sets**: The application is deployed using Kubernetes with multiple replicas of the Node.js server. This ensures that if one instance fails, others can handle the traffic, maintaining high availability.
  
   * **Health Checks**: Kubernetes performs regular health checks on the pods. If a pod fails, Kubernetes automatically restarts it to ensure continuous availability.

2. **Load Balancing**:
   * **Service Load Balancer**: Kubernetes services use load balancers to distribute incoming traffic across multiple pods, preventing any single pod from becoming a bottleneck.

3. **Monitoring and Alerts**:
   * **Prometheus and Grafana**: Integrating monitoring tools like Prometheus and Grafana helps track the health and performance of the application. Alerts can be set up to notify the team of any issues, allowing for quick resolution.

### Scalability ###
1. **Horizontal Pod Autoscaling**:
   * **Autoscaling**: Kubernetes can automatically scale the number of pods based on CPU and memory usage. This ensures the application can handle increased load by adding more instances as needed.
  
2. **Redis Caching**:
   * **Caching Layer**: Using Redis as a caching layer reduces the load on the OpenChargeMap API and MongoDB by storing frequently accessed data. This improves response times and reduces the need for repeated data fetching.

3. **Database Indexing**:
   * **Efficient Queries**: Proper indexing in MongoDB ensures that queries are executed efficiently, even as the dataset grows. This helps maintain performance under high load.

### Addressing Timeouts ###
1. **Timeout Settings**:
   * **API Requests**: Set appropriate timeout settings for API requests to the OpenChargeMap API to prevent long-running requests from blocking the system.
  
   * **Database Operations**: Configure timeouts for database operations to ensure that slow queries do not impact the overall performance.

2. **Retry Mechanisms**:
   * **Exponential Backoff**: Implement retry mechanisms with exponential backoff for API requests and database operations. This helps handle transient errors and network issues gracefully.

### Fault Tolerance ###
1. **Circuit Breaker Pattern**:
   * **Circuit Breaker**: Implement the circuit breaker pattern to detect failures and prevent cascading failures. If a service is failing, the circuit breaker trips and prevents further requests to the failing service, allowing it to recover.
  
2. **Graceful Degradation**:
   * **Fallback Mechanisms**: Implement fallback mechanisms to provide degraded functionality when certain services are unavailable. For example, if the Redis cache is down, the application can fetch data directly from MongoDB.

3. **Data Replication**:
   * **MongoDB Replica Sets**: Use MongoDB replica sets to ensure data redundancy and high availability. If the primary node fails, a secondary node can take over, ensuring continuous data availability.

## GraphQL Integration ##
The GraphQL endpoint is implemented using Apollo Server, which provides a flexible and powerful way to query and manipulate the imported charging station data. Here’s a detailed explanation of how the GraphQL endpoint is set up and how it serves the data:
### Implementation of the GraphQL Endpoint ###
1. **Setting up Apollo Server**:
   * Apollo Server is initialized with type definitions (<kbd>typeDefs</kbd>) and resolvers (<kbd>resolvers</kbd>).
   * The server listens on a specified port and provides a GraphQL Playground for testing queries.

2. **Type Definitions**:
   * Define the schema for the data, including the types and queries.
   * The <kbd>ChargingStation</kbd> type represents the structure of the charging station data.
   * The <kbd>Query</kbd> type defines the available queries, such as <kbd>chargingStations</kbd>.
  
3. **Resolvers**:
   * Implement the logic for fetching data in response to GraphQL queries.
   * The <kbd>chargingStations</kbd> resolver fetches data from MongoDB.

### Example Code ###
```javascript
# schema.graphql
const typeDefs = gql`
 type AddressInfo {
   id: Int
   title: String
   addressLine1: String
   town: String
   stateOrProvince: String
   postcode: String
   countryId: Int
   latitude: Float
   longitude: Float
   distanceUnit: Int
 }

 type Connection {
   id: Int
   connectionTypeId: Int
   statusTypeId: Int
   levelId: Int
   powerKW: Float
   quantity: Int
 }

 type ChargingStation {
   isRecentlyVerified: Boolean
   dateLastVerified: String
   id: Int
   uuid: String
   dataProviderId: Int
   operatorId: Int
   usageTypeId: Int
   addressInfo: AddressInfo
   connections: [Connection]
   numberOfPoints: Int
   statusTypeId: Int
   dateLastStatusUpdate: String
   dataQualityLevel: Int
   dateCreated: String
   submissionStatusTypeId: Int
 }

 type Query {
  chargingStations: [ChargingStation!]!
 }
`;
```
```javascript
# resolver
const resolvers = {
        Query: {
          chargingStations: async (parent: any, args: any, context: { chargingStationService: ChargingStationService; },                                  info: any) => {
            const {chargingStationService} = context;
            return await chargingStationService.getAllStations();
          },
        }
};
```
```javascript
# Apollo server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ chargingStationService }),
    formatError: (error) => {
        return new GraphQLError(error.message);
    },
  });
  await server.start();
  app.listen({ port: process.env.PORT }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
```
### Request ###
Here's a an exmaple request of GraphQL Query to fetch charging station data:
```javascript
query {
  chargingStations {
    id
    addressInfo {
      addressLine1
    }
    connections {
      quantity
      id
      powerKW
    }
  }
}
```
### Response ###
The response from the server would like this:
```json
{
  "data": {
    "chargingStations": [
      {
        "id": 303671,
        "addressInfo": {
          "addressLine1": "Jerry Croft"
        },
        "connections": [
          {
            "quantity": 1,
            "id": 572835,
            "powerKW": 50
          },
          {
            "quantity": 1,
            "id": 572836,
            "powerKW": 50
          },
          {
            "quantity": 1,
            "id": 572837,
            "powerKW": 22
          },
          {
            "quantity": 1,
            "id": 572838,
            "powerKW": 50
          },
          {
            "quantity": 1,
            "id": 572839,
            "powerKW": 50
          },
          {
            "quantity": 1,
            "id": 572840,
            "powerKW": 11
          }
        ]
      }
    ]
  }
}
```

## Monitoring and Logging ##
Monitoring and logging are essential for maintaining the health and performance of your microservice. Here’s how the project can ensure the effective monitoring and logging:

### Monitoring ###
1. **Prometheus and Grafana**:
   * **Prometheus**: Collects metrics from your application and infrastructure. It scrapes data from endpoints and stores it in a time-series database.
   * **Grafana**: Visualizes the metrics collected by Prometheus. You can create dashboards to monitor various aspects of your application, such as CPU usage, memory usage, request rates, and error rates.

   **Setup**:
      * **Prometheus Configuration**:
        ```yaml
        global:
          scrape_interval: 15s
        scrape_configs:
          - job_name: 'nodejs'
            static_configs:
              - targets: ['<nodejs-service>:4000']
        ```
      * **Grafana Dashboard**: Create dashboards in Grafana to visualize metrics. You can use pre-built dashboards or create custom ones based on your needs.

2. **Kubernetes Monitoring**:
   * **Kubernetes Metrics Server**: Provides resource usage metrics for nodes and pods.
   * **Kube-State-Metrics**: Exposes Kubernetes cluster state metrics.
   * **Alertmanager**: Sends alerts based on Prometheus metrics.

   **Setup**:
   * Deploy the metrics server and kube-state-metrics in your Kubernetes cluster.
   * Configure Alertmanager to send alerts to your preferred notification channels (e.g., email, Slack).

### Logging ###
1. **Error and Exception Logging**:
   * Capture and log errors and exceptions with sufficient context to aid in troubleshooting.
   * We have used a logging library like Winston in Node.js to handle different log levels (e.g., DEBUG, INFO, WARN, ERROR).

2. **Correlation IDs**:
   * Use correlation IDs to trace requests across different services. This helps in tracking the flow of a request and identifying where issues occur.
   * Generate a unique correlation ID for each request and include it in all logs related to that request.
   **Example**:
     ```javascript
     import { v4 as uuidv4 } from 'uuid';

      const requestLogger = (req, res, next) => {
        const correlationId = uuidv4();
        req.correlationId = correlationId;
        res.setHeader('X-Correlation-ID', correlationId);
        logger.info('Incoming request', { correlationId, path: req.path });
        next();
      }
      
      app.use(requestLogger);
     ```
