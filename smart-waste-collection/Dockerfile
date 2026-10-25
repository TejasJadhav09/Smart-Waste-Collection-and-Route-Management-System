
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src ./src

RUN chmod +x mvnw
RUN ./mvnw -B -DskipTests clean package
RUN jar tf target/smart-waste-collection-0.0.1-SNAPSHOT.jar | grep "BOOT-INF/classes/application.properties"
EXPOSE 8080
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar target/smart-waste-collection-0.0.1-SNAPSHOT.jar"]
