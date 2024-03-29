# Asqa

Question answering bot. Natural language understanding deep learning model for lnog form answers on open domain quations.

## Goal

Research trying to provide simple architecture, which will able to answer on questions in quality suitable for real usage as QA system or search engine.

## Roadmap

- [x] QA model for [ELI5 dataset](https://facebookresearch.github.io/ELI5/explore.html)
- [x] Telegram bot integration
- [ ] Cache answers and search
- [ ] Add rating for answers
- [ ] Use Bigger Wikipedia index, instead [Wiki40b](https://www.tensorflow.org/datasets/catalog/wiki40b) use [wikipedia_en_100_0](https://huggingface.co/datasets/wiki_snippets), which contain two times bigger dataset. Use[index guide](https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index) for make search possible
- [ ] QA model for [SQuAD dataset](https://rajpurkar.github.io/SQuAD-explorer/)
- [ ] QA model for [CoQA dataset](https://stanfordnlp.github.io/coqa/)
- [ ] QA model for [QReCC dataset](https://github.com/apple/ml-qrecc)
- [ ] Site for direct bot conversation
- [ ] Add twitter integration
- [ ] Add urls to wikipedia pages in answers
- [ ] Setup CI/CD for service deployment
- [ ] Setup CI/CD for models deployment
- [ ] Split search index and dataset, and increase search service count for paralel computation
- [ ] Make hyperparametor tuning for Faiss search library

## Development

For create development enviroment used docker. For start development containers and notebooks inside type

```bash
make start
```

### NN platform

For start NN platform gateway only just run

```bash
make platform-gateway
```

open <http://localhost:8910/graphql>

### Start specific containers

For start research Jupiter notebook type

```bash
make notebook
```

For notebook in search labmda enviroment type

```bash
make search-notebook
```

### Deploy image

For deploy image in aws registry need

```bash
# Firstly get your AWS ACCOUNT ID 
aws sts get-caller-identity

# Login docker
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com

# Build image locally
docker build -t asqa-search:0.1.0 .

# Tag image relative to your account
docker tag asqa-search:0.1.0 <aws_account_id>.dkr.ecr.<region>.amazonaws.com/<my-repository>:<tag>

# Push image
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/<my-repository>:<tag>
```

### Interacting with kafka

```bash
# use this command for send pssages
kubectl run kafka-producer-2 -ti --image=quay.io/strimzi/kafka:0.24.0-kafka-2.8.0 --rm=true --restart=Never -- bin/kafka-console-producer.sh --broker-list kafka-kafka-bootstrap:9092 --topic message.to.user.v1

# use this command for receive topics
kubectl run kafka-consumer -ti --image=quay.io/strimzi/kafka:0.24.0-kafka-2.8.0 --rm=true --restart=Never -- bin/kafka-console-consumer.sh --bootstrap-server kafka-kafka-bootstrap:9092 --topic message.to.user.v1 --from-beginning
```

### Backup and restore mongodb

For backup local mongodb and restore in cloud kubernetes 
need archive local mongo from docker-compose

```bash
docker exec asqa_mongo_1 sh -c 'exec mongodump -d search-passages -u root -p example --authenticationDatabase admin --gzip --archive > /archive/search-passages.archive.gzip'
```

then need [install mongorestore](https://docs.mongodb.com/database-tools/installation/installation/) 
and port-forward to mongodb container

```bash
kubectl port-forward mongodb-<pod-id> 27017:27017
```

Restore database from local files

```bash
mongorestore --uri="mongodb://root:mongodb-asqa-password@localhost:27017/?authSource=admin" --db=search-passages --gzip --archive="./mongo-data/archive/search-passages.archive.gzip"
```

## Known Issues

### Expect container which in crash loop

Add coommand to pod container, for make container stuck

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: persistent-volume
spec:
  containers:
    - name: busybox
      # Add this command
      command: ['tail', '-f', '/dev/null']
```

then exec bash in running container

```bash
kubectl exec -it mongo-pod -- bash 
```

